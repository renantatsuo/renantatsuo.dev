import Link from "next/link";

type PostPaginationProps = {
  nextPost: Post;
  prevPost: Post;
};

function PostPagination({ nextPost, prevPost }: PostPaginationProps) {
  return (
    <article
      className="grid grid-cols-1 grid-rows-[auto_auto] gap-y-4 justify-end w-full text-sm mt-4 mb-8 sm:grid-cols-2 sm:grid-rows-1 sm:justify-between"
      style={{ gridTemplate: '"next prev"' }}
    >
      {nextPost && (
        <Link href="/post/[slug]" as={`/post/${nextPost.slug}`} legacyBehavior>
          <a
            className="cursor-pointer max-w-44 border-none md:max-w-88 md:m-0"
            style={{ gridArea: "next" }}
          >
            {"<= "} {nextPost.title}
          </a>
        </Link>
      )}
      {prevPost && (
        <Link href="/post/[slug]" as={`/post/${prevPost.slug}`} legacyBehavior>
          <a
            className="cursor-pointer max-w-44 border-none md:max-w-88 md:m-0"
            style={{ gridArea: "prev" }}
          >
            {prevPost.title}
            {" =>"}
          </a>
        </Link>
      )}
    </article>
  );
}

export default PostPagination;
