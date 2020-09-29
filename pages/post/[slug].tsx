import Post from "@lib/post/Post";
import * as Posts from "@lib/post/Posts";
import Head from "next/head";
import ReactMarkdown from "react-markdown";

type PostPageProps = {
  post: Post;
};

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

export async function getStaticPaths() {
  const posts = await Posts.getPosts();
  const paths = posts.map((post) => `/post/${post.slug}`);

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const post = await Posts.getPost(slug);
  return { props: { post } };
}
