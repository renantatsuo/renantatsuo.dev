import CH from "@components/CodeHighlighter";
import FormattedDate from "@lib/date/FormattedDate";
import { DATE_FORMATTER_OPTIONS } from "@lib/static";
import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { PostContainer, PostDate, PostHeader, PostTitle } from "./styles";

type PostProps = {
  post: Post;
};

export default function PostContent({ post }: PostProps) {
  const postDate = new Date(post.createdAt);
  const formattedCreatedAt = FormattedDate(postDate, DATE_FORMATTER_OPTIONS);

  return (
    <PostContainer>
      <PostHeader>
        <PostTitle>{post.title}</PostTitle>
        <PostDate>published on {formattedCreatedAt.toString()}</PostDate>
      </PostHeader>
      <ReactMarkdown
        children={post.content}
        remarkPlugins={[gfm]}
        components={{
          pre: FixedPreComponent,
          code: CodeHighlighter,
        }}
      />
    </PostContainer>
  );
}

function FixedPreComponent(component) {
  const isCode = component.node.children[0].tagName == "code";

  if (isCode) {
    return component.children;
  }

  return <pre>{component.children}</pre>;
}

function CodeHighlighter({ node, ...props }) {
  return (
    <CH
      className={props.className}
      inline={props.inline}
      value={props.children}
    />
  );
}
