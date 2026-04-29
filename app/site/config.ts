import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  defaultLanguage: "en-US",
  avatarSrc: "/images/avatar/xinxian.png",
  resume: {
    href: "/documents/resume.md",
    downloadName: "resume.md",
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
  visitorCount: 100,
} satisfies SiteConfig;
