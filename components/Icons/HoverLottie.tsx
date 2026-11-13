import type { AnimationItem } from "lottie-web";
import * as React from "react";
import { mountAnimation } from "~/lib/lottie_poster/player";
import { cn } from "~/lib/utils";

export type LottieIcon = {
  /** Svg markup of the first frame, shown until the animation takes over. */
  poster: string;
  /** Loads the animation data, typically a dynamic import of its json. */
  animation: () => Promise<{ default: object }>;
};

type HoverLottieProps = LottieIcon & {
  className?: string;
};

const ignore = () => {};

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Plays the animation on the stage while hovered, loading it on first use.
 */
function useHoverPlayback(animation: LottieIcon["animation"]) {
  const stage = React.useRef<HTMLSpanElement>(null);
  const player = React.useRef<Promise<AnimationItem> | null>(null);
  const isHovered = React.useRef(false);

  React.useEffect(
    () => () => {
      // Destroying empties the stage, which brings the poster back.
      player.current?.then((item) => item.destroy(), ignore);
      player.current = null;
    },
    [],
  );

  const play = () => {
    const container = stage.current;
    isHovered.current = true;
    if (!container || prefersReducedMotion()) return;

    player.current ??= animation().then(({ default: data }) =>
      mountAnimation(container, data),
    );
    const loading = player.current;
    loading.then(
      (item) => {
        if (isHovered.current) item.goToAndPlay(0, true);
      },
      // The poster stays, and the next hover gets to try again.
      () => {
        if (player.current === loading) player.current = null;
      },
    );
  };

  const rewind = () => {
    isHovered.current = false;
    player.current?.then((item) => item.goToAndStop(0, true), ignore);
  };

  return { stage, play, rewind };
}

/**
 * An icon that plays its Lottie animation while hovered.
 *
 * The poster is plain svg, so it is part of the server-rendered html. The
 * animation and its engine are only fetched on the first hover, and the
 * poster hides itself (in css) for as long as the stage has something on it.
 */
export default function HoverLottie({
  poster,
  animation,
  className,
}: HoverLottieProps) {
  const { stage, play, rewind } = useHoverPlayback(animation);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid *:col-start-1 *:row-start-1 [&>:not(:empty)+*]:hidden",
        className,
      )}
      onPointerEnter={play}
      onPointerLeave={rewind}
    >
      <span ref={stage} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: build-time svg from our own animation files */}
      <span dangerouslySetInnerHTML={{ __html: poster }} />
    </span>
  );
}
