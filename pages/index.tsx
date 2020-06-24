import Head from "next/head";

export default function Home() {
  return (
    <div className="container">
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
    </div>
  );
}
