import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import GoogleAnalytics from "~/components/GoogleAnalytics";
import { GA_ID } from "~/lib/static";
import appCss from "~/styles/globals.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "apple-mobile-web-app-title", content: "renan.dev" },
      { name: "application-name", content: "renan.dev" },
      { name: "msapplication-TileColor", content: "#ff235b" },
      { name: "theme-color", content: "#ff235b" },
    ],
    links: [
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#ff235b" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  const isProduction = import.meta.env.PROD;
  return (
    <html className="dark">
      <head>
        {isProduction && <GoogleAnalytics gaId={GA_ID} />}
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />

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
    </html>
  );
}
