import { readFileSync } from "node:fs";
import type { Plugin } from "vite";
import { renderPoster } from "./render.ts";

const QUERY = "?poster";
// The suffix keeps the id from ending in `.json`, which vite would parse.
const VIRTUAL = { prefix: "\0lottie-poster:", suffix: ".svg-string" };

/**
 * Lets a Lottie animation be imported as the svg markup of its first frame:
 *
 * ```ts
 * import poster from "./github.json?poster";
 * ```
 *
 * The poster is rendered at build time, so the browser never needs the
 * animation engine to show it.
 */
export function lottiePoster(): Plugin {
  return {
    name: "lottie-poster",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!source.endsWith(QUERY)) return null;
      const resolved = await this.resolve(
        source.slice(0, -QUERY.length),
        importer,
        { skipSelf: true },
      );
      return resolved && `${VIRTUAL.prefix}${resolved.id}${VIRTUAL.suffix}`;
    },
    load(id) {
      if (!id.startsWith(VIRTUAL.prefix)) return null;
      const file = id.slice(VIRTUAL.prefix.length, -VIRTUAL.suffix.length);
      this.addWatchFile(file);
      const poster = renderPoster(JSON.parse(readFileSync(file, "utf8")));
      return `export default ${JSON.stringify(poster)};`;
    },
  };
}
