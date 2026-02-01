import { lazy, Suspense } from "react";

const Giscus = lazy(() => import("@giscus/react"));

function Comments() {
  if (typeof window === "undefined") {
    return null;
  }

  const theme = `${window.location.origin}/giscus-theme.css`;

  return (
    <Suspense>
      <Giscus
        id="comments"
        repo="renantatsuo/renantatsuo.dev"
        repoId="MDEwOlJlcG9zaXRvcnkyNzQ1MTk4MjY="
        category="Comments"
        categoryId="DIC_kwDOEFzXEs4C1vES"
        mapping="pathname"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme}
        lang="en"
        loading="lazy"
      />
    </Suspense>
  );
}

export default Comments;
