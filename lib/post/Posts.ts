import { FileSystem } from "@lib/filesystem/FileSystem";
import matter from "gray-matter";
import "reflect-metadata";
import { container } from "tsyringe";
import "../AppContainer";

/**
 * Get a list of posts from the markdown files.
 */
export async function getPosts(): Promise<Post[]> {
  const fs: FileSystem = container.resolve("FileSystem");
  const postList = await fs.listFiles("posts");
  const posts = postList.map(loadPostFromFile);
  return Promise.all(posts);
}

/**
 * Get a post from its slug.
 *
 * @param slug the post slug
 */
export function getPost(slug: string): Promise<Post> {
  return loadPostFromFile(`${slug}.md`);
}

/**
 * Load a post from the post filename.
 *
 * @param filename the post filename
 */
async function loadPostFromFile(filename: string): Promise<Post> {
  const fs: FileSystem = container.resolve("FileSystem");
  const file = await fs.readFile(`posts/${filename}`);
  const { data, content } = matter(file);

  return {
    ...data,
    content,
    excerpt: createExcerpt(content),
  } as Post;
}

/**
 * Create an except to a post.
 *
 * @param content The post content
 */
function createExcerpt(content: string): string {
  return `${content.split("\n").slice(0, 4).join(" ")}...`;
}
