import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "app",
  // GitHub Pages needs a static SPA build.
  ssr: false,
  // GitHub Pages project site path:
  // - dev: serve at "/"
  // - prod: deploy under "/Personal-Web/"
  basename: process.env.NODE_ENV === "production" ? "/Personal-Web" : "/",
} satisfies Config;
