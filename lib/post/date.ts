/**
 * Format a post date for display.
 *
 * The locale and time zone are fixed, so the server and every browser render
 * the same text, and the day is the one written in the post.
 *
 * @param createdAt the post date, e.g. 2026-04-21
 */
export function formatPostDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("en-US", { timeZone: "UTC" });
}
