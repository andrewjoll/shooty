import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";

export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [eslint()],
});
