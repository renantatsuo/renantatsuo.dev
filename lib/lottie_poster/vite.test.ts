import path from "node:path";
import type { Plugin } from "vite";
import { renderPoster } from "./render";
import { lottiePoster } from "./vite";

const animation = path.resolve(
  __dirname,
  "../../components/Icons/Animations/github.json",
);

type Hooks = {
  resolveId: (
    this: { resolve: (source: string, importer?: string) => unknown },
    source: string,
    importer?: string,
  ) => Promise<string | null>;
  load: (
    this: { addWatchFile: (file: string) => void },
    id: string,
  ) => string | null;
};

const hooks = (plugin: Plugin) => plugin as unknown as Hooks;

describe("lottiePoster", () => {
  it("runs before vite's own json handling", () => {
    expect(lottiePoster().enforce).toBe("pre");
  });

  it("ignores imports without the poster query", async () => {
    const resolve = vi.fn();

    const id = await hooks(lottiePoster()).resolveId.call(
      { resolve },
      "./github.json",
      "/app/icons.ts",
    );

    expect(id).toBeNull();
    expect(resolve).not.toHaveBeenCalled();
  });

  it("leaves unresolvable poster imports to the other resolvers", async () => {
    const id = await hooks(lottiePoster()).resolveId.call(
      { resolve: async () => null },
      "./missing.json?poster",
      "/app/icons.ts",
    );

    expect(id).toBeNull();
  });

  it("resolves poster imports to a virtual module json plugins won't claim", async () => {
    const resolve = vi.fn(async () => ({ id: animation }));

    const id = await hooks(lottiePoster()).resolveId.call(
      { resolve },
      "./github.json?poster",
      "/app/icons.ts",
    );

    expect(resolve).toHaveBeenCalledWith("./github.json", "/app/icons.ts", {
      skipSelf: true,
    });
    expect(id?.startsWith("\0")).toBe(true);
    expect(id).not.toMatch(/\.json($|\?)/);
  });

  it("ignores modules it did not resolve", () => {
    const addWatchFile = vi.fn();

    expect(
      hooks(lottiePoster()).load.call({ addWatchFile }, animation),
    ).toBeNull();
    expect(addWatchFile).not.toHaveBeenCalled();
  });

  it("loads the poster as a default-exported svg string and watches the source", async () => {
    const plugin = hooks(lottiePoster());
    const addWatchFile = vi.fn();
    const id = await plugin.resolveId.call(
      { resolve: async () => ({ id: animation }) },
      "./github.json?poster",
    );

    const code = plugin.load.call({ addWatchFile }, id ?? "");
    const svg = JSON.parse(
      code?.replace(/^export default /, "").replace(/;$/, "") ?? "",
    );

    expect(svg).toBe(renderPoster(require(animation)));
    expect(addWatchFile).toHaveBeenCalledWith(animation);
  });
});
