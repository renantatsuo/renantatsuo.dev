import { PostList } from "@components/PostList";
import UserInfo from "@components/UserInfo";
import Post from "@lib/post/Post";
import * as Posts from "@lib/post/Posts";
import User from "@lib/user/User";
import * as Users from "@lib/user/Users";
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
    </>
  );
}

interface HomeProps {
  posts: Post[];
  user: User;
}

export async function getStaticProps() {
  const posts = await Posts.getPosts();
  const user = await Users.getUser();

  return {
    props: {
      posts,
      user,
    },
  };
}
