/**
 * Post specification.
 */
export default interface Post {
  /**
   * The post slug.
   * e.g. this-is-an-example-post
   */
  slug: string;

  /**
   * The post title.
   */
  title: string;

  /**
   * The post date.
   */
  createdAt: string;

  /**
   * The post content (markdown.)
   */
  content: string;

  /**
   * The post excerpt.
   */
  excerpt: string;
}
