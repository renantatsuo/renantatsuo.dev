import Link from "next/link";
import { PaginationContainer, PaginationLink } from "./styles";

type PaginationProps = {
  nextPost: Post;
  prevPost: Post;
};

export function Pagination({ nextPost, prevPost }: PaginationProps) {
  return (
    <PaginationContainer>
      {nextPost && (
        <Link href="/post/[slug]" as={`/post/${nextPost.slug}`}>
          <PaginationLink position="next">
            {"<= "} {nextPost.title}
          </PaginationLink>
        </Link>
      )}
      {prevPost && (
        <Link href="/post/[slug]" as={`/post/${prevPost.slug}`}>
          <PaginationLink position="prev">
            {prevPost.title}
            {" =>"}
          </PaginationLink>
        </Link>
      )}
    </PaginationContainer>
  );
}
