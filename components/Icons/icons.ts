import codepen from "./Animations/codepen.json?poster";
import github from "./Animations/github.json?poster";
import linkedin from "./Animations/linkedin.json?poster";
import twitter from "./Animations/twitter.json?poster";
import type { LottieIcon } from "./HoverLottie";
import LottieType from "./LottieType";

/**
 * Every icon: its poster is rendered at build time, and its animation is
 * only downloaded when something asks for it.
 */
export const ICONS: Record<LottieType, LottieIcon> = {
  [LottieType.CODEPEN]: {
    poster: codepen,
    animation: () => import("./Animations/codepen.json"),
  },
  [LottieType.GITHUB]: {
    poster: github,
    animation: () => import("./Animations/github.json"),
  },
  [LottieType.LINKEDIN]: {
    poster: linkedin,
    animation: () => import("./Animations/linkedin.json"),
  },
  [LottieType.TWITTER]: {
    poster: twitter,
    animation: () => import("./Animations/twitter.json"),
  },
};
