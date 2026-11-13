import { Link } from "@tanstack/react-router";
import { formatPostDate } from "~/lib/post/date";

type PostListElementProps = {
  post: Post;
};

function PostListItem({
  post: { createdAt, excerpt, slug, title },
}: PostListElementProps) {
  return (
    <article className="flex flex-col">
      <header className="flex flex-col">
        <h2 className="m-0">
          <Link
            to="/post/$slug"
            params={{ slug }}
            className="border-none! font-bold text-accent!"
          >
            {title}
          </Link>
        </h2>
        <small className="text-muted">{`published on ${formatPostDate(createdAt)}`}</small>
      </header>
      <p className="my-2!">{excerpt}</p>
    </article>
  );
}

export default PostListItem;
