import { defineConfig } from "vitest/config";
import { lottiePoster } from "./lib/lottie_poster/vite";

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
