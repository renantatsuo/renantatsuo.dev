/**
 * Specification for formatting dates using Intl.
 */
export interface DateFormatDecorator {
  /**
   * The formatter options.
   */
  readonly formatterOptions: Intl.DateTimeFormatOptions;

  /**
   * Override to string.
   */
  toString(): string;
}
