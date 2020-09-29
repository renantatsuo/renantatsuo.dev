/**
 * Specification for the Http client.
 */
export default interface Http {
  /**
   * Executes a request to an URL.
   *
   * @param url the url to request
   */
  execute<T>(url: string): Promise<T>;
}
