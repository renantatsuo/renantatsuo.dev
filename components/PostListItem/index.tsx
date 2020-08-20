import { FormattedDate } from "@lib/date/FormattedDate";
import Post from "@lib/post/Post";
import Link from "next/link";
import {
  PostListItemContainer,
  PostListItemContent,
  PostListItemDate,
  PostListItemHeader,
  PostListItemTitle,
} from "./styles";

type PostListElementProps = {
  post: Post;
};

export function PostListItem({
  post: { createdAt, excerpt, slug, title },
}: PostListElementProps) {
  const formatterOptions: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  const createdAtDate = new Date(createdAt);
  const formatterCreatedAt = new FormattedDate(createdAtDate, formatterOptions);

  return (
    <PostListItemContainer>
      <PostListItemHeader>
        <PostListItemTitle>
          <Link href="/post/[slug]" as={`/post/${slug}`}>
            <a>{title}</a>
          </Link>
        </PostListItemTitle>
        <PostListItemDate>{`${formatterCreatedAt}`}</PostListItemDate>
      </PostListItemHeader>
      <PostListItemContent>{excerpt}</PostListItemContent>
    </PostListItemContainer>
  );
}
