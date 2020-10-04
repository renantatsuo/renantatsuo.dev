import Lottie from "./Lottie";

/**
 * Decorates an animationswith a flat color.
 *
 * @param animation the animation to decorate
 * @param hexColor the color to replace as css hex color (#rrggbb)
 */
export default function FlatColorLottie(
  animation: Lottie,
  hexColor: string
): Lottie {
  return {
    type: animation.type,
    data: flattenColor(hexColor, animation.data),
  };
}

/**
 * Set a flat color to an animation.
 *
 * @param hexColor the hex color string
 * @param animationData the animation data to set the color
 */
function flattenColor(hexColor, animationData) {
  const color = hexColorToLottieColor(hexColor, 1);
  const string = JSON.stringify(animationData);
  const replaced = string.replace(
    /\[\d+,\d+,\d+,[\d\.]+\]/g,
    `[${color.join(",")}]`
  );
  return JSON.parse(replaced);
}

/**
 * Regex to check and handle hex color strings.
 */
const HEX_COLOR_REGEX = new RegExp(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

/**
 * Convert a hex color to Lottie format.
 *
 * @param color the hex color
 * @param alpha the alpha (opacity)
 */
const hexColorToLottieColor = (color: string, alpha: number) => {
  if (!isValidHex(color)) {
    throw new Error("Color can be only hex or rgb array (ex. [10,20,30])");
  }

  const colors = HEX_COLOR_REGEX.exec(color);

  const red = hexToDec(colors[1]);
  const green = hexToDec(colors[2]);
  const blue = hexToDec(colors[3]);

  return [red, green, blue, alpha];
};

/**
 * Checks if a color is valid.
 *
 * @param color the color to check
 */
function isValidHex(color: string): boolean {
  return typeof color === "string" && !!color.match(HEX_COLOR_REGEX);
}

/**
 * Convert an hex string to a decimal number.
 *
 * @param hex the hex string (00, ff, fa, etc)
 */
function hexToDec(hex: string): number {
  return Math.round((parseInt(hex, 16) / 255) * 100) / 100;
}
