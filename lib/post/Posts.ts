import matter from "gray-matter";
import { FileSystem } from "~/lib/filesystem/FileSystem";
import { LocalFileSystem } from "~/lib/filesystem/LocalFileSystem";
import { POSTS_LOCATION } from "~/lib/static";

export default class Posts {
  private fs: FileSystem;
  private static instance: Posts;

  constructor(fs: FileSystem) {
    this.fs = fs;
  }

  static getInstance(): Posts {
    if (!this.instance) {
      this.instance = new Posts(new LocalFileSystem());
    }
    return this.instance;
  }

  /**
   * Get a list of posts from the markdown files.
   */
  async getPosts(): Promise<Post[]> {
    const postList = await this.fs.listFiles(`${POSTS_LOCATION}`);
    const posts = await Promise.all(postList.map(this.loadPostFromFile));
    return posts.sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );
  }

  /**
   * Get a post from its slug.
   *
   * @param slug the post slug
   */
  async getPost(slug: string): Promise<Post> {
    return this.loadPostFromFile(`${slug}.md`);
  }

  /**
   * Load a post from the post filename.
   *
   * @param filename the post filename
   */
  private loadPostFromFile = async (filename: string): Promise<Post> => {
    const file = await this.fs.readFile(`${POSTS_LOCATION}/${filename}`);
    const { data, content } = matter(file);
    const keywords = data.keywords?.split(",") ?? [];

    return {
      ...data,
      keywords: keywords.map((s: string) => s.trim()),
      content,
      excerpt: this.createExcerpt(content),
    } as Post;
  };

  /**
   * Create an except to a post.
   *
   * @param content The post content
   */
  private createExcerpt(content: string): string {
    return `${content.split("\n").slice(0, 4).join(" ")}...`;
  }
}
