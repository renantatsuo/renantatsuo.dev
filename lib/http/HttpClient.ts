/**
 * Specification for the Http client.
 */
export interface HttpClient {
  /**
   * Executes a GET request to an URL.
   *
   * @param url the url to request
   * @param opts optional request options
   */
  get<T>(url: string, opts?: GetRequestInit): Promise<T>;
}

export type GetRequestInit = Omit<RequestInit, "method">;
