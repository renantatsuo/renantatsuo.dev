/**
 * Custom error class for HTTP errors.
 */
export class HttpError extends Error {
  /**
   * Constructor.
   * @param status the HTTP status code
   * @param message the error message
   */
  constructor(public status: number, message: string) {
    super(message);
    this.status = status;
  }
}
