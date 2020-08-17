import Post from "@models/Post";
import { DarkTheme } from "@themes/DarkTheme";
import Themed from "@themes/Themed";
import Head from "next/head";
import Link from "next/link";
import { getPosts } from "../lib/Posts";

export default function Home({ posts }: HomeProps) {
  return (
    <Themed theme={new DarkTheme()}>
      <Head>
        <title>renantatsuo.dev</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#ff235b" />
        <meta name="apple-mobile-web-app-title" content="renantatsuo.dev" />
        <meta name="application-name" content="renantatsuo.dev" />
        <meta name="msapplication-TileColor" content="#ff235b" />
        <meta name="theme-color" content="#ff235b"></meta>
      </Head>

      {posts.map(({ title, slug }) => (
        <li key="title">
          <Link href="/post/[slug]" as={`/post/${slug}`}>
            <a>{title}</a>
          </Link>
        </li>
      ))}
      <link
        href="https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        rel="stylesheet"
      />
    </Themed>
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
