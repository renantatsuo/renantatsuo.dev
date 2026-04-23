import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    copyResources(),
    devtools(),
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart({
      srcDirectory: ".",
      router: {
        routesDirectory: "pages",
      },
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
      sitemap: {
        enabled: true,
        host:
          process.env.VERCEL_ENV === "production"
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : `https://${process.env.VERCEL_URL ?? "localhost:3000"}`,
      },
    }),
    nitro(),
    viteReact(),
  ],
  nitro: {
    preset: "vercel",
  },
});

async function copyResources(): Promise<Plugin> {
  // this is a workaround to copy the resources to the build directory
  // so the preview server can serve the resources and the prerender can work
  // properly.
  const fs = await import("fs");
  const path = await import("path");
  const posts = path.resolve(__dirname, "resources");
  const dist = path.resolve(__dirname, ".vercel/output/resources");
  fs.cpSync(posts, dist, { recursive: true });
  return {
    name: "copy-resources",
    writeBundle: () => {
      return Promise.resolve();
    },
  };
}
