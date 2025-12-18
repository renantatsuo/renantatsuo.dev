import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import PostList from "~/components/PostList";
import UserInfo from "~/components/UserInfo";
import Posts from "~/lib/post/Posts";
import * as Users from "~/lib/user/Users";

export const loadPosts = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const PostsInstance = Posts.getInstance();
    const posts = await PostsInstance.getPosts();
    return posts;
  });

export const loadUser = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const user = await Users.getUser();
    return user;
  });

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const posts = await loadPosts();
    const user = await loadUser();
    return { posts, user };
  },
  head: ({ loaderData: { user } = {} }) => ({
    meta: [
      { title: "Renan Tatsuo — renan.dev" },
      {
        description:
          "Renan Tatsuo's personal blog. Trying to share some knowledge and experiences.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Renan Tatsuo — renan.dev" },
      {
        property: "og:description",
        content:
          "Renan Tatsuo's personal blog. Trying to share some knowledge and experiences.",
      },
      { property: "og:url", content: "https://renan.dev/" },
      { property: "og:image", content: user?.avatar },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:domain", content: "renan.dev" },
      { name: "twitter:url", content: "https://renan.dev/" },
      { name: "twitter:title", content: "Renan Tatsuo — renan.dev" },
      {
        name: "twitter:description",
        content:
          "Renan Tatsuo's personal blog. Trying to share some knowledge and experiences.",
      },
      { name: "twitter:creator", content: "@renantatsuo" },
      { name: "twitter:image", content: user?.avatar },
    ],
  }),
});

function Home() {
  const { user, posts } = Route.useLoaderData();
  return (
    <>
      <UserInfo user={user} />
      <PostList posts={posts} />
    </>
  );
}
