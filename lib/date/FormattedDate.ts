import { DateFormatDecorator } from "./DateFormatDecorator";

/**
 * The implementation for DateFormatDecorator using Intl.
 */
export class FormattedDate extends Date implements DateFormatDecorator {
  /**
   * The date to decorate.
   */
  private date: Date;

  /**
   * The formatter options.
   */
  readonly formatterOptions: Intl.DateTimeFormatOptions;

  /**
   * Constructor.
   * @param date the date to decorate.
   */
  constructor(date: Date, formatterOptions: Intl.DateTimeFormatOptions) {
    super(date);
    this.date = date;
    this.formatterOptions = formatterOptions;
  }

  /**
   * Overrides toString to format with Intl.
   */
  toString(): string {
    return Intl.DateTimeFormat("en", this.formatterOptions).format(this.date);
  }
}
