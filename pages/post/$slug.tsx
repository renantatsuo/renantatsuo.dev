import { createFileRoute } from "@tanstack/react-router";
import PostContent from "~/components/PostContent";
import PostPagination from "~/components/PostPagination";
import UserInfo from "~/components/UserInfo";
import { loadPosts, loadUser } from "~/pages";

export const Route = createFileRoute("/post/$slug")({
  component: PostPage,
  loader: async ({ params: { slug } }) => {
    const posts = await loadPosts();
    const user = await loadUser();
    const postIndex = posts.findIndex((currPost) => currPost.slug === slug);
    const post = posts[postIndex];
    const nextPost = posts[postIndex - 1] || null;
    const prevPost = posts[postIndex + 1] || null;
    return { post, user, nextPost, prevPost };
  },
  head: ({ loaderData: { user, post } = {} }) => ({
    meta: [
      { title: post?.title },
      { description: post?.excerpt },
      { property: "og:type", content: "article" },
      { property: "og:title", content: post?.title },
      { property: "og:description", content: post?.excerpt },
      {
        property: "og:url",
        content: `https://renan.dev/post/${post?.slug}`,
      },
      { property: "og:image", content: user?.avatar },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:domain", content: "renan.dev" },
      {
        name: "twitter:url",
        content: `https://renan.dev/post/${post?.slug}`,
      },
      { name: "twitter:title", content: post?.title },
      { name: "twitter:description", content: post?.excerpt },
      { name: "twitter:creator", content: "@renantatsuo" },
      { name: "twitter:image", content: user?.avatar },
    ],
  }),
});

function PostPage() {
  const { user, post, nextPost, prevPost } = Route.useLoaderData();
  return (
    <>
      <UserInfo user={user} />
      <PostContent post={post} />
      <PostPagination nextPost={nextPost} prevPost={prevPost} />
    </>
  );
}
