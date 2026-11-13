import path from "node:path";
import { defineConfig } from "vitest/config";
import { lottiePoster } from "./lib/lottie_poster/vite";

export default defineConfig({
  plugins: [lottiePoster()],
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./"),
    },
  },
});
