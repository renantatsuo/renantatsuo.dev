import PostContent from "@components/PostContent";
import { PostPagination } from "@components/PostPagination";
import UserInfo from "@components/UserInfo";
import AppContainer from "@lib/AppContainer";
import Posts from "@lib/post/Posts";
import * as Users from "@lib/user/Users";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import React from "react";

export default function PostPage({
  post,
  user,
  nextPost,
  prevPost,
}: PostPageProps) {
  const postUrl = `https://renantatsuo.dev/post/${post.slug}`;
  return (
    <>
      <Head>
        <title>{post.title}</title>
        meta
        <meta name="description" content={post.excerpt} />
        {post.keywords && (
          <meta name="keywords" content={post.keywords.join()} />
        )}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:image" content={user.avatar} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="renantatsuo.dev" />
        <meta property="twitter:url" content={postUrl} />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:creator" content="@renantatsuo" />
        <meta name="twitter:image" content={user.avatar} />
      </Head>
      <UserInfo user={user} />
      <PostContent post={post} />
      <PostPagination nextPost={nextPost} prevPost={prevPost} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths<PostParsedUrlQuery> = async () => {
  const PostsInstance = AppContainer.resolve<Posts>(Posts);
  const posts = await PostsInstance.getPosts();
  const paths = posts.map(({ slug }) => ({
    params: {
      slug,
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<PostPageProps, PostParsedUrlQuery> =
  async ({ params: { slug } }) => {
    const PostsInstance = AppContainer.resolve<Posts>(Posts);
    const user = await Users.getUser();
    const posts = await PostsInstance.getPosts();
    const postIndex = posts.findIndex((currPost) => currPost.slug === slug);
    const post = posts[postIndex];
    const nextPost = posts[postIndex - 1] || null;
    const prevPost = posts[postIndex + 1] || null;
    return { props: { post, user, nextPost, prevPost } };
  };

type PostPageProps = {
  post: Post;
  nextPost: Post;
  prevPost: Post;
  user: User;
};

type PostParsedUrlQuery = {
  slug: string;
};
