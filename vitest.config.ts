import { defineConfig } from "vitest/config";
import { lottiePoster } from "./lib/lottie_poster/vite.ts";

export default defineConfig({
  plugins: [lottiePoster()],
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "~": import.meta.dirname,
    },
  },
});
