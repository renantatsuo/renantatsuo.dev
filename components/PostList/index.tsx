import { PostListItem } from "@components/PostListItem";
import Post from "@lib/post/Post";

type PostListProps = {
  posts: Post[];
};

export function PostList({ posts }: PostListProps) {
  return (
    <>
      {posts.map((post) => (
        <PostListItem key={post.slug} post={post} />
      ))}
    </>
  );
}
