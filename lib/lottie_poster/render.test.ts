import codepen from "~/components/Icons/Animations/codepen.json";
import twitter from "~/components/Icons/Animations/twitter.json";
import { renderPoster } from "./render";

const ids = (svg: string) =>
  [...svg.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);

describe("renderPoster", () => {
  it("renders the first frame as static svg markup", () => {
    const svg = renderPoster(codepen);

    expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 32 32"/);
    expect(svg).toContain("<path");
    expect(svg.endsWith("</svg>")).toBe(true);
  });

  it("is deterministic for the same animation", () => {
    expect(renderPoster(codepen)).toBe(renderPoster(codepen));
  });

  it("renders the requested frame", () => {
    expect(renderPoster(codepen, { frame: 20 })).not.toBe(
      renderPoster(codepen),
    );
  });

  it("scopes element ids per animation so inlined posters never collide", () => {
    const first = ids(renderPoster(codepen));
    const second = ids(renderPoster(twitter));

    expect(first.length).toBeGreaterThan(0);
    expect(second.length).toBeGreaterThan(0);
    expect(first.filter((id) => second.includes(id))).toEqual([]);
  });

  it("keeps id references pointing at the scoped ids", () => {
    const svg = renderPoster(twitter);
    const referenced = [...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);

    expect(referenced.length).toBeGreaterThan(0);
    for (const id of referenced) expect(ids(svg)).toContain(id);
  });

  it("leaves the node globals untouched", () => {
    renderPoster(codepen);

    expect("lottie" in globalThis).toBe(false);
    expect("document" in globalThis).toBe(false);
  });
});
