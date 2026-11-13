import type { AnimationItem } from "lottie-web";

/**
 * Mounts an animation in the container, paused on its first frame.
 *
 * The engine is imported here and nowhere else, so it stays out of the page
 * until the first animation is actually needed.
 */
export async function mountAnimation(
  container: Element,
  animationData: object,
): Promise<AnimationItem> {
  const { default: lottie } = await import(
    "lottie-web/build/player/lottie_svg"
  );
  return lottie.loadAnimation({
    container,
    renderer: "svg",
    loop: false,
    autoplay: false,
    animationData,
  });
}
