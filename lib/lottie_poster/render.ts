import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import type { LottiePlayer } from "lottie-web";

export type PosterOptions = {
  /** The frame to render. Defaults to the first one. */
  frame?: number;
};

const ENGINE = "lottie-web/build/player/lottie_svg.min.js";

let engineSource: string | undefined;

/**
 * The engine is evaluated inside each jsdom window instead of being imported,
 * so it never sees (or needs) node globals like `document`.
 */
function loadEngine(window: JSDOM["window"]): LottiePlayer {
  engineSource ??= readFileSync(
    createRequire(import.meta.url).resolve(ENGINE),
    "utf8",
  );
  // lottie-web paints a 1x1 canvas when it boots; jsdom has no canvas.
  window.eval(
    `HTMLCanvasElement.prototype.getContext = () => ({ fillRect() {} });${engineSource}`,
  );
  return (window as unknown as { lottie: LottiePlayer }).lottie;
}

/**
 * Renders one frame of a Lottie animation as static svg markup, ready to be
 * inlined in server-rendered html.
 *
 * Element ids are prefixed with a hash of the animation, so several posters
 * can share a page without their clip paths and gradients colliding.
 */
export function renderPoster(
  animationData: object,
  { frame = 0 }: PosterOptions = {},
): string {
  const json = JSON.stringify(animationData);
  const hash = createHash("sha1").update(json).digest("hex").slice(0, 8);
  const { window } = new JSDOM("<!doctype html><body></body>", {
    runScripts: "outside-only",
  });

  try {
    const lottie = loadEngine(window);
    lottie.setIDPrefix(`poster-${hash}`);
    const item = lottie.loadAnimation({
      container: window.document.body,
      renderer: "svg",
      loop: false,
      autoplay: false,
      // The engine mutates what it is given, so it gets its own copy.
      animationData: JSON.parse(json),
    });
    item.goToAndStop(frame, true);
    return window.document.body.innerHTML;
  } finally {
    window.close();
  }
}
