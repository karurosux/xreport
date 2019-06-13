export interface XBaseTemplateOptions {
  /**
   * This is the main template file, this file will be
   * checked to see if has other template references.
   */
  main: string

  /**
   * This is required to build relative path.
   */
  dirname: string

  encoding?: string
}
