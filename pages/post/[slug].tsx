import PostContent from "@components/PostContent";
import UserInfo from "@components/UserInfo";
import Post from "@lib/post/Post";
import * as Posts from "@lib/post/Posts";
import User from "@lib/user/User";
import * as Users from "@lib/user/Users";
import Head from "next/head";
import React from "react";

type PostPageProps = {
  post: Post;
  user: User;
};

export default function PostPage({ post, user }: PostPageProps) {
  return (
    <>
      <Head>
        <title>{post.title}</title>
        meta
        <meta name="description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta
          property="og:url"
          content={`https://renantatsuo.dev/post/${post.slug}`}
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:site" content="@renantatsuo" />
        <meta name="twitter:creator" content="@renantatsuo" />
      </Head>
      <UserInfo user={user} />
      <PostContent post={post} />
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
