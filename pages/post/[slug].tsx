import CodeHighlighter from "@components/CodeHighlighter";
import UserInfo from "@components/UserInfo";
import { FormattedDate } from "@lib/date/FormattedDate";
import Post from "@lib/post/Post";
import * as Posts from "@lib/post/Posts";
import User from "@lib/user/User";
import * as Users from "@lib/user/Users";
import Head from "next/head";
import React from "react";
import ReactMarkdown from "react-markdown";
import { PostContainer, PostDate, PostHeader, PostTitle } from "./styles";

type PostPageProps = {
  post: Post;
  user: User;
};

export default function PostPage({ post, user }: PostPageProps) {
  const formatterOptions: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  const createdAtDate = new Date(post.createdAt);
  const formattedCreatedAt = new FormattedDate(createdAtDate, formatterOptions);
  return (
    <>
      <Head>
        <title>{post.title}</title>
      </Head>
      <UserInfo user={user} />
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
    </>
  );
}

export async function getStaticPaths() {
  const posts = await Posts.getPosts();
  const paths = posts.map((post) => `/post/${post.slug}`);

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const user = await Users.getUser();
  const post = await Posts.getPost(slug);
  return { props: { post, user } };
}
