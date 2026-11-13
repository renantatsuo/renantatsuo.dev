import { ICONS } from "./icons";
import LottieType from "./LottieType";

const types = [
  LottieType.CODEPEN,
  LottieType.GITHUB,
  LottieType.LINKEDIN,
  LottieType.TWITTER,
];

describe("ICONS", () => {
  it.each(types)(
    "pairs a build-time poster with its lazy animation (%s)",
    async (type) => {
      const { poster, animation } = ICONS[type];
      const { default: data } = await animation();

      expect(poster).toMatch(/^<svg [^>]*viewBox="0 0 32 32"/);
      expect(data).toMatchObject({ w: 32, h: 32 });
    },
  );

  it("gives every icon its own poster", () => {
    const posters = types.map((type) => ICONS[type].poster);

    expect(new Set(posters).size).toBe(types.length);
  });
});
