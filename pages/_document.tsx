import Document, { Head, Html, Main, NextScript } from "next/document";
import GoogleAnalytics from "~/components/GoogleAnalytics";
import { GA_ID } from "~/lib/static";

export default class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const isProduction = process.env.NODE_ENV === "production";

    return {
      ...initialProps,
      isProduction,
    };
  }

  render() {
    const { isProduction } = this.props;
    return (
      <Html>
        <Head>
          {isProduction && <GoogleAnalytics gaId={GA_ID} />}
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
        <body>
          <Main />
          <NextScript />

          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,300;0,700;1,300;1,700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap"
            rel="stylesheet"
          />
        </body>
      </Html>
    );
  }
}

type MyDocumentProps = {
  isProduction: boolean;
};
