import { XDataAdapter } from './xdata-adapter'
import { XBaseTemplateOptions } from './xbase-template-options'

export interface XTemplateOptions extends XBaseTemplateOptions {
  /**
   * Class in charge of transform data from received source.
   * Only main template should receive data adapters
   */
  adapters?: XDataAdapter[]
}
