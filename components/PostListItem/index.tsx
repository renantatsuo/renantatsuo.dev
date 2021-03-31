import FormattedDate from "@lib/date/FormattedDate";
import { DATE_FORMATTER_OPTIONS } from "@lib/static";
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
  const postDate = new Date(createdAt);
  const formatterCreatedAt = FormattedDate(postDate, DATE_FORMATTER_OPTIONS);

  return (
    <PostListItemContainer>
      <PostListItemHeader>
        <PostListItemTitle>
          <Link href="/post/[slug]" as={`/post/${slug}`}>
            <a>{title}</a>
          </Link>
        </PostListItemTitle>
        <PostListItemDate>{`${formatterCreatedAt.toString()}`}</PostListItemDate>
      </PostListItemHeader>
      <PostListItemContent>{excerpt}</PostListItemContent>
    </PostListItemContainer>
  );
}
