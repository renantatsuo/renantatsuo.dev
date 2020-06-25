import { readdirSync, readFileSync } from "fs";
import matter from "gray-matter";
import Post from "../models/Post";

/**
 * Get a list of posts from the markdown files.
 */
export async function getPosts(): Promise<Post[]> {
  const posts = readdirSync("posts");
  return posts.map(loadPostFromFile);
}

/**
 * Get a post from its slug.
 *
 * @param slug the post slug
 */
export async function getPost(slug: string): Promise<Post> {
  return loadPostFromFile(`${slug}.md`);
}

/**
 * Load a post from the post filename.
 *
 * @param filename the post filename
 */
function loadPostFromFile(filename: string): Post {
  const file = readFileSync(`posts/${filename}`);
  const { data, content, excerpt } = matter(file, { excerpt: true });

  return {
    ...data,
    content,
    excerpt,
  } as Post;
}
