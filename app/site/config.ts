import type { SiteConfig } from "@/types";
import { withBase } from "@/utils/asset";

export const siteConfig: SiteConfig = {
  defaultLanguage: "en-US",
  avatarSrc: withBase("/images/avatar/xinxian-3.png"),
  resume: {
    href: withBase("/documents/CV_xinxianma.pdf"),
    email: "xinxian.ma@epfl.ch",
  },
  contact: {
    socials: [
      {
        label: "GitHub",
        href: "https://github.com/mxx28",
        side: "bottom",
        icon: "github",
        profile: {
          name: "mxx28",
          subtitle: "GitHub Profile",
          description:
            "Projects, research code, and experiments.",
        },
      },
      {
        label: "Email",
        href: "mailto:xinxian.ma@epfl.ch",
        side: "bottom",
        icon: "mail",
        profile: {
          name: "xinxian.ma@epfl.ch",
          subtitle: "Email",
          description: "Best way to reach me.",
        },
      },
    ],
  },
  profileLocations: "China / Switzerland / USA",
  github: {
    username: "mxx28",
  },
} satisfies SiteConfig;
