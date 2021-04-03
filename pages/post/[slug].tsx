import PostContent from "@components/PostContent";
import UserInfo from "@components/UserInfo";
import Head from "next/head";
import React from "react";

export default function PostPage({ post, user }: PostPageProps) {
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
    </>
  );
}

export const getStaticPaths: GetStaticPaths<PostParsedUrlQuery> = async () => {
  const posts = await Posts.getPosts();
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

export const getStaticProps: GetStaticProps<
  PostPageProps,
  PostParsedUrlQuery
> = async ({ params: { slug } }) => {
  const user = await Users.getUser();
  const post = await Posts.getPost(slug);
  return { props: { post, user } };
};

type PostPageProps = {
  post: Post;
  user: User;
};

type PostParsedUrlQuery = {
  slug: string;
};
