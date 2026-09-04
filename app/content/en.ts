import { defineProjects, type SiteContent } from "../types";
import { withBase } from "@/utils/asset";

const home = {
  profile: {
    tocLabel: "Profile",
    name: "Xinxian Ma",
    avatarAlt: "Xinxian Ma avatar",
    roles: ["Master in Data Science", "Machine Learning", "LLMs", "Data Science"],
  },
  about: {
    tocLabel: "About",
    greeting: [
      [
        { text: "Hi, I'm Xinxian, an M.Sc. student in Data Science at " },
        { text: "EPFL", href: "https://www.epfl.ch/" },
        { text: " in Lausanne." },
      ],
      [
        {
          text: "My research interests lie in Machine Learning and Large Language Models, particularly ",
        },
        {
          text: "efficient LLM inference and data-centric training",
          bold: true,
        },
        { text: "." },
      ],
    ],
    school: {
      name: "EPFL",
      href: "https://www.epfl.ch/",
      major: "M.Sc. in Data Science",
      majorEnglish: "Master’s student in Data Science",
    },
    status: [
      [
        { text: "Currently, I am a research intern at " },
        { text: "DLAB", href: "https://dlab.epfl.ch/" },
        {
          text: ", working on compression-aware LLMs, where I am fortunate to be supervised by Prof. ",
        },
        { text: "Robert West", href: "https://dlab.epfl.ch/people/west/" },
        { text: " and PhD student " },
        { text: "Saibo Geng", href: "https://saibo-creator.github.io/" },
        { text: ". I am also conducting research at " },
        { text: "CVLab", href: "https://www.epfl.ch/labs/cvlab/" },
        {
          text: ", working on data-aware methods for LLM training, where I am fortunate to be supervised by Prof. ",
        },
        {
          text: "Mathieu Salzmann",
          href: "https://people.epfl.ch/mathieu.salzmann?lang=en",
        },
        { text: " and PhD student " },
        { text: "Shuangqi Li", href: "https://lishuangqi.com/" },
        { text: "." },
      ],
      [
        { text: "Previously, I received my B.Sc. in Data Science from " },
        { text: "CUHK-Shenzhen", href: "https://www.cuhk.edu.cn/en" },
        {
          text: ", with a GPA of 3.9/4.0 (top 2%). I was advised by Prof. ",
        },
        { text: "Jicong Fan", href: "https://jicongfan.github.io/" },
        { text: ", with a research focus on machine learning." },
      ],
      [{ text: "I am currently seeking LLM/ML/DS internship opportunities." }],
    ],
    badges: [
      { id: "open-to-work", label: "Open to Work", icon: "briefcase" },
      { id: "ml", label: "Machine Learning", icon: "bolt" },
      { id: "llm", label: "LLMs", icon: "star" },
      { id: "data-science", label: "Data Science", icon: "code" },
      { id: "data-analysis", label: "Data Analysis", icon: "code" },
    ],
  },
  projects: {
    tocLabel: "Projects",
    title: "Projects",
    viewDetailsLabel: "View details",
  },
  socials: {
    tocLabel: "Socials",
    title: "Socials",
  },
  github: {
    tocLabel: "GitHub",
    title: "GitHub Activity",
    totalTemplate: "{count} contributions in the past year",
    activityTemplate: "{count} contributions on {date}",
    errorMessage: "Couldn't load GitHub activity right now.",
    legend: {
      less: "Less",
      more: "More",
    },
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  experiences: {
    tocLabel: "Experience",
    title: "Experience",
    items: [
      {
        id: "dlab-research-intern",
        organization: "Data Science & AI Lab (DLAB) · EPFL",
        role: "Research Intern",
        employmentType: "Research",
        kind: "research",
        period: "Feb, 2026 - Present",
        location: "Lausanne, Switzerland",
        logoText: "DL",
        logoSrc: withBase("/images/company-logos/dlab.png"),
        logoAlt: "DLAB logo",
        tags: ["LLMs", "Decoding", "NLP"],
        highlights: [
          "Worked on LLM-related research topics, exploring practical decoding and evaluation setups for controlled generation.",
          "Built lightweight experiment pipelines (data prep, prompt templates, metrics) to iterate quickly and report findings.",
        ],
      },
      {
        id: "cvlab-research-assistant",
        organization: "Computer Vision Lab (CVLab) · EPFL",
        role: "Research Assistant",
        employmentType: "Research",
        kind: "research",
        period: "Sep, 2026 - Present",
        location: "Lausanne, Switzerland",
        logoText: "CV",
        logoSrc: withBase("/images/company-logos/cvlab.png"),
        logoDarkSrc: withBase("/images/company-logos/cvlab-dark.png"),
        logoAlt: "CVLab logo",
        tags: ["LLMs", "Data-Centric Training"],
        highlights: [
          "Working on data-aware methods for LLM training, exploring how data selection and composition affect training efficiency and downstream performance.",
        ],
      },
      {
        id: "sribd-research-assistant",
        organization: "Shenzhen Research Institute of Big Data",
        role: "Research Assistant",
        employmentType: "Research",
        kind: "research",
        period: "Apr, 2024 - Aug, 2024",
        location: "Shenzhen, China",
        logoText: "SR",
        logoSrc: withBase("/images/company-logos/sribd.png"),
        logoAlt: "Shenzhen Research Institute of Big Data logo",
        tags: ["Federated Learning", "High-dimensional Visualization", "MMD"],
        highlights: [
          "Researched high-dimensional data visualization in federated learning and proposed Fed-tSNE and Fed-UMAP, leveraging kernel functions and maximum mean discrepancy (MMD) to improve privacy protection and effectiveness.",
          "Extended the approach to additional algorithms for clustering distributed data, including federated spectral clustering.",
        ],
      },
      {
        id: "flywheel-data-scientist-intern",
        organization: "Flywheel",
        role: "Data Scientist Intern",
        employmentType: "Internship",
        kind: "internship",
        period: "Jun, 2025 - Aug, 2025",
        location: "Shenzhen, China",
        logoText: "FW",
        logoSrc: withBase("/images/company-logos/flywheel.png"),
        logoAlt: "Flywheel logo",
        tags: ["AMC SQL", "Analytics", "Attribution", "Benchmarking"],
        highlights: [
          "Built standardized sales and media performance analytics pipelines using Amazon Marketing Cloud (AMC) SQL, enabling audience package creation and multi-dimensional cross-campaign benchmarking.",
          "Produced custom insights and activation strategies for key brands by analyzing incremental customer acquisition, lifecycle value, and purchase paths to optimize targeting and media spend.",
        ],
      },
      {
        id: "anker-data-scientist-intern",
        organization: "Anker",
        role: "Data Scientist Intern",
        employmentType: "Internship",
        kind: "internship",
        period: "Feb, 2025 - Aug, 2025",
        location: "Shenzhen, China",
        logoText: "A",
        logoSrc: withBase("/images/company-logos/anker.svg"),
        logoDarkSrc: withBase("/images/company-logos/anker-dark.svg"),
        logoAlt: "Anker logo",
        tags: ["EDA", "Anomaly Detection", "Forecasting", "LightGBM", "Clustering", "DTW"],
        highlights: [
          "Performed end-to-end EDA on sales data, including anomaly detection and treatment to improve data reliability for downstream modeling.",
          "Built demand forecasting pipelines with time-series models and LightGBM to support inventory planning.",
          "Developed product profiles via clustering using wavelet denoising and DTW-based time-series K-means.",
        ],
      },
      {
        id: "fandao-ai-engineer-intern",
        organization: "Fandao",
        role: "AI Engineer Intern",
        employmentType: "Internship",
        kind: "internship",
        period: "Jun, 2024 - Aug, 2024",
        location: "Guangzhou, China",
        logoText: "FD",
        tags: ["Fine-tuning", "Dataset", "Evaluation", "RAG"],
        highlights: [
          "Contributed to customized AI content generation by participating in fine-tuning, model testing, dataset preparation, and workflow design to ensure robust solution delivery.",
          "Assisted in development of an AI customer service system using Retrieval-Augmented Generation (RAG), enhancing product sales and department satisfaction.",
        ],
      },
    ],
  },
  researchExperiences: {
    tocLabel: "Research Experience",
    title: "Research Experience",
    items: [],
  },
  publications: {
    tocLabel: "Publications",
    title: "Publications",
    items: [
      {
        id: "fed-tsne-umap",
        title: "Federated t-SNE and UMAP for Distributed Data Visualization",
        authors: "Dong Qiao, Xinxian Ma, Jicong Fan",
        cover: withBase("/images/publications/fed-tsne-umap-cover.png"),
        tags: ["AAAI 2025"],
        topics: ["ML", "Unsupervised Learning", "Federated Learning"],
        abstract:
          "High-dimensional data visualization is crucial in the big data era and these techniques such as t-SNE and UMAP have been widely used in science and engineering. Big data, however, is often distributed across multiple data centers and subject to security and privacy concerns, which leads to difficulties for the standard algorithms of t-SNE and UMAP.\n\nTo tackle the challenge, this work proposes Fed-tSNE and Fed-UMAP, which provide high-dimensional data visualization under the framework of federated learning, without exchanging data across clients or sending data to the central server. The main idea of Fed-tSNE and Fed-UMAP is implicitly learning the distribution information of data in a manner of federated learning and then estimating the global distance matrix for t-SNE and UMAP. To further enhance the protection of data privacy, we propose Fed-tSNE+ and Fed-UMAP+. We also extend our idea to federated spectral clustering, yielding algorithms of clustering distributed data.\n\nIn addition to these new algorithms, we offer theoretical guarantees of optimization convergence, distance and similarity estimation, and differential privacy. Experiments on multiple datasets demonstrate that, compared to the original algorithms, the accuracy drops of our federated algorithms are tiny.",
        links: {
          arxiv: "https://arxiv.org/abs/2412.13495",
          code: "https://github.com/mxx28/Federated-t-SNE-and-UMAP",
        },
      },
    ],
  },
  skills: {
    tocLabel: "Skills",
    title: "Skills & Technologies",
    items: [
      { name: "Python", icon: "python" },
      { name: "Java" },
      { name: "R" },
      { name: "MATLAB" },
      { name: "PyTorch" },
      { name: "Transformers" },
      { name: "Hugging Face" },
      { name: "LLMs" },
      { name: "NLP" },
      { name: "Machine Learning" },
      { name: "Deep Learning" },
      { name: "Data Analysis" },
      { name: "SQL" },
      { name: "Time Series" },
      { name: "Scikit-learn" },
      { name: "Pandas" },
      { name: "NumPy" },
      { name: "Jupyter" },
      { name: "Docker", icon: "docker" },
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "Linux" },
      { name: "AWS" },
      { name: "JavaScript", icon: "javascript" },
    ],
  },
  studyNotes: {
    tocLabel: "Study Note",
    title: "Study Notes",
    viewDetailsLabel: "View details",
    items: [
      {
        id: "cs336-spring2025",
        title: "Stanford CS336 Spring-2025",
        summary:
          "Stanford CS336 · Language Modeling from Scratch — personal lecture notes.",
        badge: "Course",
      },
      {
        id: "self-study-notes",
        title: "Self Study Notes",
        summary:
          "A running notebook for ideas I'm currently teaching myself, from LLM inference tricks to systems details.",
        badge: "Self Study",
      },
    ],
  },
  now: {
    tocLabel: "Now",
    title: "Now",
    items: [
      {
        id: "shipping",
        title: "Refining this personal site",
        description:
          "Turning projects, experience, and contact paths into a clearer home base for people who want to understand what I am building.",
        badge: "Iterating",
        icon: "code-dots",
      },
      {
        id: "learning",
        title: "Deepening modern web engineering",
        description:
          "Focused on React, TypeScript, motion, server-side capabilities, and developer experience while turning practice into reusable patterns.",
        badge: "Learning",
        icon: "book",
      },
      {
        id: "direction",
        title: "Looking for front-end / full-stack internships",
        description:
          "Hoping to join a team that cares about product experience and engineering quality, with room to own shippable features.",
        badge: "Open",
        icon: "target",
      },
    ],
  },
  resume: {
    tocLabel: "Resume",
    title: "Resume",
    badges: {
      available: "Open to internships",
      updated: "Spring 2026 update",
    },
    description: "Take a look at my CV for a quick view of my experience.",
    viewLabel: "View CV",
  },
  gallery: {
    tocLabel: "Gallery",
    title: "Gallery",
    items: [
      { src: withBase("/images/gallery/morges.png"), alt: "Morges lake view" },
      { src: withBase("/images/gallery/luzern.png"), alt: "Luzern lion monument" },
      { src: withBase("/images/gallery/basel.png"), alt: "Basel cathedral" },
      { src: withBase("/images/gallery/bern.png"), alt: "Bern old town" },
      { src: withBase("/images/gallery/boston.jpg"), alt: "Boston skyline at sunset" },
      { src: withBase("/images/gallery/new-york.jpg"), alt: "Statue of Liberty" },
    ],
  },
  funFacts: {
    tocLabel: "Fun Facts",
    title: "Fun Facts",
    items: [
      "I’m a Cities: Skylines addict — I can spend hours designing and tuning virtual cities until (almost) everything works.",
      "I secretly enjoy traffic jams… as long as I’m not in a hurry. Watching congestion emerge in a simulation is strangely satisfying (and educational).",
      "I love architecture and urban design. Between the ages of 8 and 15, I created 200+ building designs for my own imaginary cities—long before I knew what a real city planner does.",
      "I’m a loyal NBA Golden State Warriors fan.",
      "I’m also a Chelsea FC supporter in the Premier League.",
    ],
  },
} satisfies SiteContent["home"];

const projects = defineProjects({
  "nextjs-authentication-scaffold": {
    slug: "nextjs-authentication-scaffold",
    cover: withBase("/images/projects/nextjs-authentication-scaffold.png"),
    name: "SwissReach",
    summary:
      "Swiss public transport, retail density, and everyday access in one national view.",
    intro: "everyday reachability, visualized Switzerland//",
    detail:
      "Swiss public transport, retail density, and everyday access in one national view.",
    status: "online",
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript 5",
      "Prisma 7",
      "PostgreSQL",
      "Prisma Migrate",
      "Tailwind CSS 4",
      "Shadcn UI",
      "Radix UI",
      "Motion",
      "Tabler Icons",
      "React Hook Form",
      "Zod",
      "Input OTP",
      "Jose",
      "WebAuthn",
      "Server-only",
      "ESLint",
      "Prettier",
    ],
    links: {
      github: "https://github.com/com-480-data-visualization/SwissReach",
      readme:
        "https://github.com/com-480-data-visualization/SwissReach#readme",
      issues:
        "https://github.com/com-480-data-visualization/SwissReach/issues",
    },
  },
  "zip2zip-compression": {
    slug: "zip2zip-compression",
    // TODO: placeholder copy carried over from the previous project — replace with real Zip2Zip content.
    cover: withBase("/images/projects/zip2zip.png"),
    name: "Zip2Zip Compression",
    summary: "Compression-aware tokenization for more efficient LLM training and inference.",
    intro: "Compression-aware tokenization for more efficient LLM training and inference.",
    detail: "Compression-aware tokenization for more efficient LLM training and inference.",
    status: "online",
    stack: [],
    links: {
      demo: "https://zip2zip-tokenizer-main-zygo.vercel.app/",
    },
  },
});

const ui = {
  common: {
    copy: "Copy",
    copied: "Copied",
    backToTop: "Back to top",
    status: {
      building: "Building",
      online: "Online",
      beta: "Beta",
      concept: "Concept",
    },
    links: {
      github: "GitHub",
      readme: "README",
      issues: "Issues",
      demo: "Demo",
      website: "Website",
    },
  },
  projectDetail: {
    title: "Projects",
    tabsLabel: "Project detail sections",
    tabs: {
      overview: "Overview",
      readme: "README",
      website: "Repository",
    },
    cloneProtocols: {
      https: "HTTPS",
      ssh: "SSH",
      cli: "GitHub CLI",
    },
    stackTitle: "Stack used",
    readmeEnterFullscreen: "Expand README",
    readmeExitFullscreen: "Collapse README",
    readmeLoading: "Loading README...",
    readmeError: "README could not be loaded.",
    cloneDescription: "Clone this repository with the selected command.",
    downloadZip: "Download ZIP",
    websiteUnavailable: "Repository links are not available.",
  },
  settings: {
    buttonAria: "Open settings menu",
    menuLabel: "Settings",
    themeLabel: "Theme",
    dividerLabel: "Dividers",
    languageLabel: "Language",
    dividerPresets: "Choose a style",
    themeOptions: {
      light: "Light",
      dark: "Dark",
    },
    dividerOptions: {
      "double-solid": "Double solid",
      "single-dashed": "Single dashed",
      "soft-fade": "Soft fade",
      "dot-chain": "Dot chain",
      hairline: "Hairline",
      "dash-dot": "Dash dot",
      "center-glow": "Center glow",
      "woven-grid": "Woven grid",
    },
    languageOptions: {
      "en-US": "English",
      "zh-CN": "Chinese",
    },
  },
  notFound: {
    eyebrow: "Page Not Found",
    description:
      "The page you were looking for slipped away quietly. Nothing is broken, it just is not here right now.",
  },
  errorBoundary: {
    oops: "Oops!",
    unexpectedDescription: "An unexpected error occurred.",
    errorTitle: "Error",
    notFoundDescription: "The requested page could not be found.",
  },
  scrollAnchor: {
    label: "Home section navigation",
    title: "On this page",
  },
  actions: {
    sendEmail: "Send an email",
    reserve: "Book an intro call",
    accountPrefix: "Here are my",
    accountHighlight: "socials",
  },
} satisfies SiteContent["ui"];

const content = {
  home,
  projects,
  ui,
} satisfies SiteContent;

export default content;
