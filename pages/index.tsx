import { GetStaticProps } from "next";
import Head from "next/head";
import PostList from "~/components/PostList";
import UserInfo from "~/components/UserInfo";
import Posts from "~/lib/post/Posts";
import * as Users from "~/lib/user/Users";

export default function Home({ posts, user }: HomeProps) {
  const title = "Renan Tatsuo — renantatsuo.dev";
  const description = `Renan Tatsuo's personal blog. Trying to share some knowledge and experiences.`;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://renantatsuo.dev/`} />
        <meta property="og:image" content={user.avatar} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="renantatsuo.dev" />
        <meta property="twitter:url" content="https://renantatsuo.dev" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:creator" content="@renantatsuo" />
        <meta name="twitter:image" content={user.avatar} />
      </Head>
      <UserInfo user={user} />
      <PostList posts={posts} />
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const PostsInstance = Posts.getInstance();
  const posts = await PostsInstance.getPosts();
  const user = await Users.getUser();

  return {
    props: {
      posts,
      user,
    },
  };
};

type HomeProps = {
  posts: Post[];
  user: User;
};
