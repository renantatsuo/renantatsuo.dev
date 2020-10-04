import CodeHighlighter from "@components/CodeHighlighter";
import FormattedDate from "@lib/date/FormattedDate";
import Post from "@lib/post/Post";
import { DATE_FORMATTER_OPTIONS } from "@lib/static";
import React from "react";
import ReactMarkdown from "react-markdown";
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
        <PostDate>posted on {formattedCreatedAt.toString()}</PostDate>
      </PostHeader>
      <ReactMarkdown
        source={post.content}
        renderers={{ code: CodeHighlighter }}
      />
    </PostContainer>
  );
}
