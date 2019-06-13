import { XBaseTemplate } from './xbase-template'
import { XTemplateOptions } from './xtemplate-options'
import { Subject, forkJoin } from 'rxjs'
import { XDataAdapter } from './xdata-adapter'
import * as ejs from 'ejs'
import { tap } from 'rxjs/operators'
import { set, assign } from 'lodash'

export class XTemplate extends XBaseTemplate {
  templateCompiled$ = new Subject<string>()

  private adapters: XDataAdapter[] = []

  constructor(options: XTemplateOptions) {
    super(options)
    this.adapters = options.adapters || []
  }

  compileWithSource(source: any) {
    if (!this.adapters.length) {
      const rendered = ejs.render(this.mainTemplateContent, source)
      this.templateCompiled(rendered)
    } else {
      const result: any = {}
      const obserables = this.adapters.map(adapter => {
        return adapter.options.adapter(source).pipe(
          tap(data => {
            if (
              !adapter.options.path ||
              adapter.options.path === '' ||
              adapter.options.path === '.'
            ) {
              assign(result, data)
            } else {
              set(result, adapter.options.path, data)
            }
          })
        )
      })

      forkJoin(obserables).subscribe(() => {
        const rendered = ejs.render(this.mainTemplateContent, result)
        this.templateCompiled(rendered)
      })
    }
  }

  private templateCompiled(rendered: string) {
    this.templateCompiled$.next(rendered)
    this.templateCompiled$.complete()
  }
}
