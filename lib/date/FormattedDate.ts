/**
 * Decorates a date with a formatter.
 *
 * @param date the date to decorate
 * @param formatterOptions the formatter options
 */
export default function FormattedDate(
  date: Date,
  formatterOptions: Intl.DateTimeFormatOptions
) {
  return {
    ...date,
    toString: () => Intl.DateTimeFormat("en", formatterOptions).format(date),
  };
}
