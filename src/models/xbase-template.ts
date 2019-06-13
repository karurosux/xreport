import { XBaseTemplateOptions } from './xbase-template-options'
import { readFile } from 'fs'
import { join as joinPath, dirname, basename } from 'path'
import { Subject, forkJoin, of } from 'rxjs'
import { tap, switchMap, map } from 'rxjs/operators'
import { XTemplate } from './xtemplate'

export class XBaseTemplate {
  mainTemplatePath: string = ''
  mainTemplateOriginalContent: string = ''
  mainTemplateContent: string = ''
  templatePaths: { [variable: string]: string } = {}
  childrenTemplates: { [variable: string]: XBaseTemplate } = {}

  // Events
  mainFileLoaded$ = new Subject<string | any>()
  childrenTemplatesAppended$ = new Subject<string | any>()
  templateReady$ = new Subject<string>()

  private fileVariablesRegex = /{{([^}]*)}}/g

  constructor(public options: XBaseTemplateOptions) {
    this.watchForMainFileLoaded()
    this.readMainTemplate()
  }

  private watchForMainFileLoaded() {
    this.mainFileLoaded$
      .pipe(
        tap(content => (this.mainTemplateOriginalContent = content)),
        map(() => this.extractTemplatePaths()),
        switchMap(() => this.mapChildrenTemplates()),
        switchMap(() => this.watchForChildrenTemplatesAppend()),
        map(() => this.replaceMainTemplateVariables())
      )
      .subscribe({
        next: () => {
          if (!this.childrenTemplatesAppended$.isStopped) {
            this.triggerChildrenTemplatesAppended()
          }
          if (this instanceof XTemplate) {
            this.templateReady$.next(this.mainTemplateContent)
            this.templateReady$.complete()
          }
        }
      })
  }

  /**
   * Reads main template and gets it content.
   */
  private readMainTemplate() {
    this.mainTemplatePath = joinPath(this.options.dirname, this.options.main)
    readFile(this.mainTemplatePath, this.options.encoding || 'utf8', (_, content) =>
      this.mainFileLoaded$.next(content)
    )
  }

  /**
   * Scans main file for other file paths.
   */
  private extractTemplatePaths() {
    // Gets an array of strings of the parts that match the
    // regex to detect variables, which represents the files
    // that will be appended in the place them were placed.
    const variables =
      (this.mainTemplateOriginalContent.match(this.fileVariablesRegex) as string[]) || []

    // Having this array ready, now we map this variables array
    // into a object with variable as key and path as value.
    this.templatePaths = variables.reduce((acum, item) => {
      return {
        ...acum,
        [item]: joinPath(dirname(this.mainTemplatePath), item.replace(/{/g, '').replace(/}/g, ''))
      }
    }, {})

    // Return the mapped object.
    return this.templatePaths
  }

  private mapChildrenTemplates() {
    this.childrenTemplates = Object.keys(this.templatePaths).reduce((acum, variable) => {
      const path = this.templatePaths[variable]
      return {
        ...acum,
        [variable]: new XBaseTemplate({
          main: basename(path),
          dirname: dirname(path),
          encoding: this.options.encoding
        })
      }
    }, {})

    return of(this.childrenTemplates)
  }

  private watchForChildrenTemplatesAppend() {
    const variables = Object.keys(this.childrenTemplates)

    // If no children, just triggers event.
    if (variables.length === 0) {
      this.mainTemplateContent = this.mainTemplateOriginalContent
      this.triggerChildrenTemplatesAppended()
      return of(this.childrenTemplates)
    }

    const templateSubjects = variables.map(variable =>
      this.childrenTemplates[variable].childrenTemplatesAppended$.asObservable()
    )

    return forkJoin(templateSubjects).pipe(map(() => this.childrenTemplates))
  }

  private triggerChildrenTemplatesAppended() {
    this.childrenTemplatesAppended$.next(this.mainTemplateContent)
    this.childrenTemplatesAppended$.complete()
  }

  private replaceMainTemplateVariables() {
    const variables = Object.keys(this.childrenTemplates)
    this.mainTemplateContent = this.mainTemplateOriginalContent

    variables.forEach(variable => {
      const childTemplate = this.childrenTemplates[variable]

      if (childTemplate) {
        const content = childTemplate.mainTemplateContent
        this.mainTemplateContent = this.mainTemplateContent.replace(
          new RegExp(variable, 'g'),
          content
        )
      }
    })

    return this.mainTemplateContent
  }
}
