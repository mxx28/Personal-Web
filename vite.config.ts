import { fileURLToPath, URL } from "node:url";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  // GitHub Pages project site base path.
  base: mode === "production" ? "/Personal-Web/" : "/",
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
}));
