import { PostList } from "@components/PostList";
import UserInfo from "@components/UserInfo";
import Post from "@lib/post/Post";
import { getPosts } from "@lib/post/Posts";
import User from "@lib/user/User";
import { getUser } from "@lib/user/Users";
import Head from "next/head";
import React from "react";

export default function Home({ posts, user }: HomeProps) {
  return (
    <>
      <Head>
        <title>renantatsuo.dev</title>
      </Head>
      <UserInfo user={user} />
      <PostList posts={posts} />
      <link
        href="https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        rel="stylesheet"
      />
    </>
  );
}

interface HomeProps {
  posts: Post[];
  user: User;
}

export async function getStaticProps() {
  const posts = await getPosts();
  const user = await getUser();

  return {
    props: {
      posts,
      user,
    },
  };
}
