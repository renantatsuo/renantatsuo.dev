import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart({
      srcDirectory: ".",
      router: {
        routesDirectory: "pages",
      },
      sitemap: {
        host: "https://renan.dev",
      },
    }),
    nitro(),
    viteReact(),
  ],
  nitro: {},
});
