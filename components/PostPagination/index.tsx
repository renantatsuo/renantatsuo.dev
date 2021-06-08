import Link from "next/link";
import { PostPaginationContainer, PostPaginationLink } from "./styles";

type PostPaginationProps = {
  nextPost: Post;
  prevPost: Post;
};

export function PostPagination({ nextPost, prevPost }: PostPaginationProps) {
  return (
    <PostPaginationContainer>
      {nextPost && (
        <Link href="/post/[slug]" as={`/post/${nextPost.slug}`}>
          <PostPaginationLink position="next">
            {"<= "} {nextPost.title}
          </PostPaginationLink>
        </Link>
      )}
      {prevPost && (
        <Link href="/post/[slug]" as={`/post/${prevPost.slug}`}>
          <PostPaginationLink position="prev">
            {prevPost.title}
            {" =>"}
          </PostPaginationLink>
        </Link>
      )}
    </PostPaginationContainer>
  );
}
