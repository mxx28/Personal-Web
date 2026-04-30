export type SiteLanguage = "en-US" | "zh-CN";

export type Theme = "dark" | "light";

export type DividerStyle =
  | "double-solid"
  | "single-dashed"
  | "soft-fade"
  | "dot-chain"
  | "hairline"
  | "dash-dot"
  | "center-glow"
  | "woven-grid";

export type HoverSide = "left" | "top" | "bottom" | "right";

export type SocialIconKey = "github" | "mail";

export type SocialLinkConfig = {
  label: string;
  href: string;
  side: HoverSide;
  icon?: SocialIconKey;
  profile: {
    name: string;
    subtitle: string;
    description?: string;
  };
};

export type SiteConfig = {
  defaultLanguage: SiteLanguage;
  avatarSrc: string;
  resume: {
    href: string;
    downloadName: string;
    email: string;
  };
  contact: {
    bookingUrl?: string;
    socials: SocialLinkConfig[];
  };
  /** Shown in profile header (e.g. countries / bases). */
  profileLocations?: string;
};

export type HomeSectionId = string;

export type HomeSectionDepth = 2 | 3;

export type HomeSectionMeta = {
  id: HomeSectionId;
  depth: HomeSectionDepth;
  label: string;
};

export type LinkType = "github" | "demo" | "website" | "readme" | "issues";

export type ProjectStatus = "building" | "online" | "beta" | "concept";

export type Project<Slug extends string = string> = {
  slug: Slug;
  cover: string;
  name: string;
  summary: string;
  intro: string;
  detail: string;
  status: ProjectStatus;
  stack: string[];
  links?: Partial<Record<LinkType, string>>;
};

export type ProjectMap<Slug extends string = string> = {
  [Key in Slug]: Project<Key>;
};

export function defineProjects<const Slug extends string>(
  projects: ProjectMap<Slug>,
) {
  return projects;
}

export type BadgeIconKey =
  | "briefcase"
  | "school"
  | "code"
  | "star"
  | "rocket"
  | "bolt"
  | "coffee"
  | "moon";

export type BadgeItem = {
  id: string;
  label: string;
  icon: BadgeIconKey;
};

export type ExperienceEntry = {
  id: string;
  organization: string;
  role: string;
  employmentType?: string;
  kind?: "research" | "internship";
  period: string;
  location: string;
  logoText: string;
  logoSrc?: string;
  logoDarkSrc?: string;
  logoAlt?: string;
  tags?: string[];
  hidden?: boolean;
  highlights: string[];
};

export type SkillIconKey =
  | "nextjs"
  | "react"
  | "nodejs"
  | "mongodb"
  | "mysql"
  | "prisma"
  | "tailwind"
  | "javascript"
  | "typescript"
  | "git"
  | "github"
  | "rust"
  | "python"
  | "threejs"
  | "vite"
  | "vue"
  | "radix"
  | "docker";

export type SkillEntry = {
  name: string;
  icon?: SkillIconKey;
};

export type NowIconKey = "code-dots" | "book" | "target";

export type NowEntry = {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: NowIconKey;
};

export type HomeProfileContent = {
  tocLabel: string;
  name: string;
  avatarAlt: string;
  roles: string[];
};

export type HomeAboutContent = {
  tocLabel: string;
  greeting:
    | string
    | Array<{
        text: string;
        href?: string;
      }>
    | Array<
        Array<{
          text: string;
          href?: string;
        }>
      >;
  status:
    | string
    | Array<{
        text: string;
        href?: string;
      }>
    | Array<
        Array<{
          text: string;
          href?: string;
        }>
      >;
  school: {
    name: string;
    href?: string;
    major: string;
    majorEnglish: string;
  };
  badges: BadgeItem[];
};

export type HomeProjectsContent = {
  tocLabel: string;
  title: string;
  viewDetailsLabel: string;
};

export type HomeSocialsContent = {
  tocLabel: string;
  title: string;
};

export type HomeGithubContent = {
  tocLabel: string;
  title: string;
  totalTemplate: string;
  activityTemplate: string;
  legend: {
    less: string;
    more: string;
  };
  weekdays: [string, string, string, string, string, string, string];
};

export type HomeExperiencesContent = {
  tocLabel: string;
  title: string;
  items: ExperienceEntry[];
};

export type HomeResearchExperiencesContent = {
  tocLabel: string;
  title: string;
  items: ExperienceEntry[];
};

export type PublicationLinkKey = "pdf" | "arxiv" | "code" | "project";

export type PublicationEntry = {
  id: string;
  title: string;
  authors: string;
  venue?: string;
  year?: string;
  date?: string;
  cover?: string;
  abstract?: string;
  tags?: string[];
  topics?: string[];
  links?: Partial<Record<PublicationLinkKey, string>>;
};

export type HomePublicationsContent = {
  tocLabel: string;
  title: string;
  items: PublicationEntry[];
};

export type HomeSkillsContent = {
  tocLabel: string;
  title: string;
  items: SkillEntry[];
};

export type HomeNowContent = {
  tocLabel: string;
  title: string;
  items: NowEntry[];
};

export type BlogEntry = {
  id: string;
  title: string;
  summary: string;
  cover: string;
  badge?: string;
};

export type HomeBlogsContent = {
  tocLabel: string;
  title: string;
  viewDetailsLabel: string;
  items: BlogEntry[];
};

export type HomeFunFactsContent = {
  tocLabel: string;
  title: string;
  items: string[];
};

export type HomeResumeContent = {
  tocLabel: string;
  title: string;
  badges: {
    available: string;
    updated: string;
  };
  heading: string;
  description: string;
  downloadLabel: string;
  copyEmailLabel: string;
  emailCopiedLabel: string;
};

export type HomeNewsletterContent = {
  tocLabel: string;
  title: string;
  formLabel: string;
  emailLabel: string;
  placeholder: string;
  submitLabel: string;
  successMessage: string;
  errors: {
    required: string;
    invalid: string;
  };
};

export type HomeIntroductionContent = {
  tocLabel: string;
  quote: string;
  author: string;
};

export type HomeContent = {
  profile: HomeProfileContent;
  about: HomeAboutContent;
  projects: HomeProjectsContent;
  socials: HomeSocialsContent;
  github: HomeGithubContent;
  experiences: HomeExperiencesContent;
  researchExperiences: HomeResearchExperiencesContent;
  publications: HomePublicationsContent;
  skills: HomeSkillsContent;
  blogs: HomeBlogsContent;
  funFacts: HomeFunFactsContent;
  now: HomeNowContent;
  resume: HomeResumeContent;
  newsletter: HomeNewsletterContent;
  introduction: HomeIntroductionContent;
};

export type UiCommonContent = {
  copy: string;
  copied: string;
  backToTop: string;
  status: Record<ProjectStatus, string>;
  links: Record<LinkType, string>;
};

export type UiProjectDetailContent = {
  title: string;
  tabsLabel: string;
  tabs: {
    overview: string;
    readme: string;
    website: string;
  };
  cloneProtocols: {
    https: string;
    ssh: string;
    cli: string;
  };
  stackTitle: string;
  readmeEnterFullscreen: string;
  readmeExitFullscreen: string;
  readmeLoading: string;
  readmeError: string;
  cloneDescription: string;
  downloadZip: string;
  websiteUnavailable: string;
};

export type UiSettingsContent = {
  buttonAria: string;
  menuLabel: string;
  themeLabel: string;
  dividerLabel: string;
  languageLabel: string;
  dividerPresets: string;
  themeOptions: Record<Theme, string>;
  dividerOptions: Record<DividerStyle, string>;
  languageOptions: Record<SiteLanguage, string>;
};

export type UiNotFoundContent = {
  eyebrow: string;
  description: string;
};

export type UiErrorBoundaryContent = {
  oops: string;
  unexpectedDescription: string;
  errorTitle: string;
  notFoundDescription: string;
};

export type UiScrollAnchorContent = {
  label: string;
  title: string;
};

export type UiActionsContent = {
  sendEmail: string;
  reserve: string;
  accountPrefix: string;
  accountHighlight: string;
};

export type UiContent = {
  common: UiCommonContent;
  projectDetail: UiProjectDetailContent;
  settings: UiSettingsContent;
  notFound: UiNotFoundContent;
  errorBoundary: UiErrorBoundaryContent;
  scrollAnchor: UiScrollAnchorContent;
  actions: UiActionsContent;
};

export type SiteContent<Slug extends string = string> = {
  home: HomeContent;
  projects: ProjectMap<Slug>;
  ui: UiContent;
};
