import Link from "next/link";
import {
  PostListItemContainer,
  PostListItemContent,
  PostListItemDate,
  PostListItemHeader,
  PostListItemTitle,
} from "./PostListItem.styled";

type PostListElementProps = {
  post: Post;
};

function PostListItem({
  post: { createdAt, excerpt, slug, title },
}: PostListElementProps) {
  const postDate = new Date(createdAt);

  return (
    <PostListItemContainer>
      <PostListItemHeader>
        <PostListItemTitle>
          <Link href="/post/[slug]" as={`/post/${slug}`}>
            {title}
          </Link>
        </PostListItemTitle>
        <PostListItemDate>{`published on ${postDate.toLocaleDateString()}`}</PostListItemDate>
      </PostListItemHeader>
      <PostListItemContent>{excerpt}</PostListItemContent>
    </PostListItemContainer>
  );
}

export default PostListItem;
