import { PostList } from "@components/PostList";
import Post from "@lib/post/Post";
import { getPosts } from "@lib/post/Posts";
import Head from "next/head";

export default function Home({ posts }: HomeProps) {
  return (
    <>
      <Head>
        <title>renantatsuo.dev</title>
      </Head>
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
}

export async function getStaticProps() {
  const posts = await getPosts();

  return {
    props: {
      posts,
    },
  };
}
