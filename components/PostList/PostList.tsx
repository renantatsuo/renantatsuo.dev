import PostListItem from "~/components/PostListItem";

type PostListProps = {
  posts: Post[];
};

function PostList({ posts }: PostListProps) {
  return (
    <>
      {posts.map((post) => (
        <PostListItem key={post.slug} post={post} />
      ))}
    </>
  );
}

export default PostList;
