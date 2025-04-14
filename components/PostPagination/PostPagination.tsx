import Link from "next/link";
import {
  PostPaginationContainer,
  PostPaginationLink,
} from "./PostPagination.styled";

type PostPaginationProps = {
  nextPost: Post;
  prevPost: Post;
};

function PostPagination({ nextPost, prevPost }: PostPaginationProps) {
  return (
    <PostPaginationContainer>
      {nextPost && (
        <Link href="/post/[slug]" as={`/post/${nextPost.slug}`} legacyBehavior>
          <PostPaginationLink position="next">
            {"<= "} {nextPost.title}
          </PostPaginationLink>
        </Link>
      )}
      {prevPost && (
        <Link href="/post/[slug]" as={`/post/${prevPost.slug}`} legacyBehavior>
          <PostPaginationLink position="prev">
            {prevPost.title}
            {" =>"}
          </PostPaginationLink>
        </Link>
      )}
    </PostPaginationContainer>
  );
}

export default PostPagination;
