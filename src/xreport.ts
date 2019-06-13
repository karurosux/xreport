import { XTemplate } from './models'
import { RenderPdfReportOptions } from './models/render-pdf-report-options'
import { tap, switchMap } from 'rxjs/operators'
import { launch, Browser } from 'puppeteer'
import { from, Observable } from 'rxjs'
import { get } from 'lodash'
import * as htmlToPdf from 'html-pdf-chrome'

export class XReport {
  renderPdfReport(
    template: XTemplate,
    source: any, options?:
      RenderPdfReportOptions
  ): Observable<htmlToPdf.CreateResult> {
    let compiledTemplate: string
    let browser: Browser
    const puppeteerOptions = get(options, 'puppeteerOptions', {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })
    const pdfCreateOptions = get(options, 'pdfCreateOptions', {
      printOptions: {
        scale: 1,
        preferCSSPageSize: true,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0
      }
    })

    template.templateReady$.subscribe(() => {
      template.compileWithSource(source)
    })

    return template.templateCompiled$.asObservable().pipe(
      tap(compiled => (compiledTemplate = compiled)),
      switchMap(() => from(launch(puppeteerOptions))),
      tap(createdBrowser => (browser = createdBrowser)),
      switchMap(() => from(htmlToPdf.create(compiledTemplate, pdfCreateOptions))),
      tap(() => browser.close())
    )
  }

  static getInstance() {
    return new XReport()
  }
}

export const xreport = XReport.getInstance()
export default xreport
export * from './models'
