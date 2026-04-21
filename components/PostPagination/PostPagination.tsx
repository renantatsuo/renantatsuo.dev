import { Link } from "@tanstack/react-router";

type PostPaginationProps = {
  nextPost: Post;
  prevPost: Post;
};

function PostPagination({ nextPost, prevPost }: PostPaginationProps) {
  return (
    <article
      className="mt-4 mb-8 grid w-full grid-cols-1 grid-rows-[auto_auto]
        justify-end gap-y-4 text-sm sm:grid-cols-2 sm:grid-rows-1
        sm:justify-between"
      style={{ gridTemplate: '"next prev"' }}
    >
      {nextPost && (
        <Link to="/post/$slug" params={{ slug: nextPost.slug }}>
          <a
            className="max-w-44 cursor-pointer border-none md:m-0 md:max-w-88"
            style={{ gridArea: "next" }}
          >
            {"<= "} {nextPost.title}
          </a>
        </Link>
      )}
      {prevPost && (
        <Link to="/post/$slug" params={{ slug: prevPost.slug }}>
          <a
            className="max-w-44 cursor-pointer border-none md:m-0 md:max-w-88"
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
