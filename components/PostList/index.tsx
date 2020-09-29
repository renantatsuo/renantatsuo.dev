import { PostListItem } from "@components/PostListItem";
import Post from "@lib/post/Post";

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }) {
  return (
    <>
      {posts.map((post) => (
        <PostListItem key={post.slug} post={post} />
      ))}
    </>
  );
}
