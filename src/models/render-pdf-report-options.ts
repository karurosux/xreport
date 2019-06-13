import { LaunchOptions } from 'puppeteer'
import { CreateOptions } from 'html-pdf-chrome'

export interface RenderPdfReportOptions {
  puppeteerOptions?: LaunchOptions
  pdfCreateOptions?: CreateOptions
}
