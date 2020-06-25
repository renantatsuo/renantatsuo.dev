import Head from "next/head";
import ReactMarkdown from "react-markdown";
import { getPost, getPosts } from "../../lib/Posts";
import Post from "../../models/Post";

export default function PostPage({ post }: PostPageProps) {
  return (
    <>
      <Head>
        <title>{post.title}</title>
      </Head>
      <ReactMarkdown source={post.content}></ReactMarkdown>
    </>
  );
}

interface PostPageProps {
  post: Post;
}

export async function getStaticPaths() {
  const posts = await getPosts();
  const paths = posts.map((post) => `/post/${post.slug}`);

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const post = await getPost(slug);
  return { props: { post } };
}
