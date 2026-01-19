import { Link } from "@tanstack/react-router";

type PostListElementProps = {
  post: Post;
};

function PostListItem({
  post: { createdAt, excerpt, slug, title },
}: PostListElementProps) {
  const postDate = new Date(createdAt);

  return (
    <article className="flex flex-col">
      <header className="flex flex-col">
        <h2 className="m-0">
          <Link
            to="/post/$slug"
            params={{ slug }}
            className="text-yellow! border-none! font-bold"
          >
            {title}
          </Link>
        </h2>
        <small className="text-selected">{`published on ${postDate.toLocaleDateString()}`}</small>
      </header>
      <p className="my-2!">{excerpt}</p>
    </article>
  );
}

export default PostListItem;
