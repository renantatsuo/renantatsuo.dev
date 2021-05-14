import CH from "@components/CodeHighlighter";
import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { PostContainer, PostDate, PostHeader, PostTitle } from "./styles";

type PostProps = {
  post: Post;
};

export default function PostContent({ post }: PostProps) {
  const postDate = new Date(post.createdAt);

  return (
    <PostContainer>
      <PostHeader>
        <PostTitle>{post.title}</PostTitle>
        <PostDate>published on {postDate.toLocaleDateString()}</PostDate>
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
