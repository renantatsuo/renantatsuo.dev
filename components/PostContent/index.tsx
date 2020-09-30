import CodeHighlighter from "@components/CodeHighlighter";
import { FormattedDate } from "@lib/date/FormattedDate";
import Post from "@lib/post/Post";
import React from "react";
import ReactMarkdown from "react-markdown";
import { PostContainer, PostDate, PostHeader, PostTitle } from "./styles";

type PostProps = {
  post: Post;
};

export default function PostContent({ post }: PostProps) {
  const formatterOptions: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  const createdAtDate = new Date(post.createdAt);
  const formattedCreatedAt = new FormattedDate(createdAtDate, formatterOptions);
  return (
    <PostContainer>
      <PostHeader>
        <PostTitle>{post.title}</PostTitle>
        <PostDate>posted on {formattedCreatedAt.toString()}</PostDate>
      </PostHeader>
      <ReactMarkdown
        source={post.content}
        renderers={{ code: CodeHighlighter }}
      />
    </PostContainer>
  );
}
