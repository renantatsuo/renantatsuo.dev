import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CH from "~/components/CodeHighlighter";
import { formatPostDate } from "~/lib/post/date";

type PostProps = {
  post: Post;
};

function PostContent({ post }: PostProps) {
  return (
    <article className="w-full [&_:not(pre)_code]:rounded [&_:not(pre)_code]:bg-card [&_:not(pre)_code]:px-1 [&_table]:border-collapse [&_table_td]:border-2 [&_table_td]:border-border [&_table_td]:px-3 [&_table_td]:py-2">
      <header className="flex flex-col">
        <h1 className="m-0 font-bold! text-accent!">{post.title}</h1>
        <small className="text-muted">
          published on {formatPostDate(post.createdAt)}
        </small>
      </header>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: FixedPreComponent,
          code: CodeHighlighter,
        }}
      >
        {post.content}
      </Markdown>
    </article>
  );
}

function FixedPreComponent(component) {
  const isCode = component.node.children[0].tagName === "code";

  if (isCode) {
    return component.children;
  }

  return <pre>{component.children}</pre>;
}

function CodeHighlighter({ node, ...props }) {
  if (!props.className) {
    return <code>{props.children}</code>;
  }
  return (
    <CH
      className={props.className}
      inline={props.inline}
      value={props.children}
    />
  );
}

export default PostContent;
