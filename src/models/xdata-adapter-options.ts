import { Observable } from 'rxjs'

export interface XDataAdapterOptions {
  /**
   * Path where the adapter result data will be stored.
   */
  path: string
  /**
   * Method that transforms data from the received source to
   * the desired form.
   */
  adapter: (source: any) => Observable<any>
}
