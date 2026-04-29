import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "app",
  // GitHub Pages needs a static SPA build.
  ssr: false,
  // Repo: https://mxx28.github.io/Personal-Web/
  basename: "/Personal-Web",
} satisfies Config;
