import { type ProjectMap, type SiteContent } from "../types";
import { withBase } from "@/utils/asset";

type ProjectSlug = Extract<
  keyof typeof import("./en").default.projects,
  string
>;

const home = {
  profile: {
    tocLabel: "名片",
    name: "Xinxian Ma",
    avatarAlt: "Xinxian Ma 头像",
    roles: ["机器学习", "大语言模型", "数据科学"],
  },
  about: {
    tocLabel: "介绍",
    greeting:
      "Hi, I'm Xinxian Ma, 来自中国。我非常感兴趣于机器学习及大语言模型。",
    school: {
      name: "EPFL（洛桑联邦理工学院）",
      href: "https://www.epfl.ch/",
      major: "数据科学硕士（Master in Data Science）",
      majorEnglish: "M.Sc. in Data Science",
    },
    status: [
      { text: "目前在 " },
      { text: "DLAB", href: "https://dlab.epfl.ch/" },
      { text: " 开展研究，方向为 LLM decoding，受 " },
      { text: "Robert West", href: "https://www.robertwest.io/" },
      { text: " 和博士生 Saibo Geng 指导。本科毕业于 " },
      { text: "CUHK(SZ)", href: "https://www.cuhk.edu.cn/zh-hans" },
      { text: " 数据科学专业，受樊继聪教授指导，聚焦机器学习。当前正在寻找 LLM / ML / DS 方向的实习机会。" },
    ],
    badges: [
      { id: "open-to-work", label: "求职中", icon: "briefcase" },
      { id: "ml", label: "机器学习", icon: "bolt" },
      { id: "llm", label: "大语言模型", icon: "star" },
      { id: "data-science", label: "数据科学", icon: "code" },
      { id: "data-analysis", label: "数据分析", icon: "code" },
    ],
  },
  projects: {
    tocLabel: "项目",
    title: "项目",
    viewDetailsLabel: "查看详情",
  },
  socials: {
    tocLabel: "社交账号",
    title: "社交账号",
  },
  github: {
    tocLabel: "GitHub",
    title: "GitHub 活跃度",
    totalTemplate: "过去一年共 {count} 次贡献",
    activityTemplate: "{date} 共 {count} 次贡献",
    errorMessage: "暂时无法加载 GitHub 活跃度数据。",
    legend: {
      less: "少",
      more: "多",
    },
    weekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  },
  experiences: {
    tocLabel: "经历",
    title: "经历",
    items: [
      {
        id: "dlab-research-intern",
        organization: "EPFL 数据科学与人工智能实验室（DLAB）",
        role: "研究实习生",
        employmentType: "科研",
        kind: "research",
        period: "2026年2月 - 至今",
        location: "洛桑，瑞士",
        logoText: "DL",
        logoSrc: withBase("/images/company-logos/dlab.png"),
        logoAlt: "DLAB logo",
        tags: ["大语言模型（LLM）", "解码", "NLP"],
        highlights: [
          "围绕大语言模型相关方向开展研究，探索可控生成的解码策略与评测设置。",
          "搭建轻量实验流程（数据准备、prompt 模板、指标计算），支持快速迭代与结论汇报。",
        ],
      },
      {
        id: "cvlab-research-assistant",
        organization: "EPFL 计算机视觉实验室（CVLab）",
        role: "研究助理",
        employmentType: "科研",
        kind: "research",
        period: "2026年9月 - 至今",
        location: "洛桑，瑞士",
        logoText: "CV",
        logoSrc: withBase("/images/company-logos/cvlab.png"),
        logoDarkSrc: withBase("/images/company-logos/cvlab-dark.png"),
        logoAlt: "CVLab logo",
        tags: ["大语言模型（LLM）", "数据驱动训练"],
        highlights: [
          "研究面向大语言模型训练的数据感知方法，探索数据选择与配比对训练效率及下游效果的影响。",
        ],
      },
      {
        id: "sribd-research-assistant",
        organization: "深圳市大数据研究院",
        role: "研究助理",
        employmentType: "科研",
        kind: "research",
        period: "2024年4月 - 2024年8月",
        location: "深圳，中国",
        logoText: "SR",
        logoSrc: withBase("/images/company-logos/sribd.png"),
        logoAlt: "Shenzhen Research Institute of Big Data logo",
        tags: ["联邦学习", "高维可视化", "MMD"],
        highlights: [
          "围绕联邦学习场景下的高维数据可视化开展研究，提出 Fed-tSNE 与 Fed-UMAP，引入核函数与最大均值差异（MMD）以提升隐私保护与可视化效果。",
          "将思路扩展到分布式数据聚类等任务，例如联邦谱聚类（spectral clustering）。",
        ],
      },
      {
        id: "flywheel-data-scientist-intern",
        organization: "Flywheel",
        role: "数据科学实习生",
        employmentType: "实习",
        kind: "internship",
        period: "2025年6月 - 2025年8月",
        location: "深圳，中国",
        logoText: "FW",
        logoSrc: withBase("/images/company-logos/flywheel.png"),
        logoAlt: "Flywheel logo",
        tags: ["AMC SQL", "分析", "归因", "对标"],
        highlights: [
          "基于 Amazon Marketing Cloud（AMC）SQL 搭建标准化销售与媒体投放效果分析管道，支持人群包构建与跨活动多维对标分析。",
          "围绕增量获客、生命周期价值（LTV）与购买路径分析，为重点品牌输出洞察与投放策略，优化定向与媒体预算分配。",
        ],
      },
      {
        id: "anker-data-scientist-intern",
        organization: "Anker",
        role: "数据科学实习生",
        employmentType: "实习",
        kind: "internship",
        period: "2025年2月 - 2025年8月",
        location: "深圳，中国",
        logoText: "A",
        logoSrc: withBase("/images/company-logos/anker.svg"),
        logoDarkSrc: withBase("/images/company-logos/anker-dark.svg"),
        logoAlt: "Anker logo",
        tags: ["EDA", "异常检测", "需求预测", "LightGBM", "聚类", "DTW"],
        highlights: [
          "对销售数据完成端到端 EDA，包括异常检测与处理，提升下游建模的数据可靠性。",
          "基于时间序列模型与 LightGBM 构建需求预测流程，为库存规划提供决策支持。",
          "使用小波去噪与基于 DTW 的时间序列 K-means 聚类构建产品画像与分群分析。",
        ],
      },
      {
        id: "fandao-ai-engineer-intern",
        organization: "Fandao",
        role: "AI 工程实习生",
        employmentType: "实习",
        kind: "internship",
        period: "2024年6月 - 2024年8月",
        location: "广州，中国",
        logoText: "FD",
        tags: ["微调", "数据集", "评测", "RAG"],
        highlights: [
          "参与定制化 AI 内容生成项目，覆盖微调、模型测试、数据集准备与流程设计，保障方案稳定落地。",
          "基于检索增强生成（RAG）协助开发 AI 客服系统，提升产品销售与部门满意度。",
        ],
      },
    ],
  },
  researchExperiences: {
    tocLabel: "科研经历",
    title: "科研经历",
    items: [],
  },
  publications: {
    tocLabel: "发表",
    title: "发表",
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
    tocLabel: "技能",
    title: "技能与技术栈",
    items: [
      { name: "Python", icon: "python" },
      { name: "Java" },
      { name: "R" },
      { name: "MATLAB" },
      { name: "PyTorch" },
      { name: "Transformers" },
      { name: "Hugging Face" },
      { name: "大语言模型（LLM）" },
      { name: "自然语言处理（NLP）" },
      { name: "机器学习" },
      { name: "深度学习" },
      { name: "数据分析" },
      { name: "SQL" },
      { name: "时间序列" },
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
    tocLabel: "学习笔记",
    title: "学习笔记",
    viewDetailsLabel: "查看详情",
    items: [
      {
        id: "cs336-spring2025",
        title: "Stanford CS336 Spring-2025",
        summary: "Stanford CS336《从零实现语言模型》— 个人课程笔记。",
        badge: "课程",
      },
      {
        id: "self-study-notes",
        title: "Self Study Notes",
        summary: "记录我最近自学的新知识点、论文理解与技术备忘，持续更新。",
        badge: "自学",
      },
    ],
  },
  blogs: {
    tocLabel: "Blogs",
    title: "Blogs",
    viewDetailsLabel: "View details",
    items: [
      {
        id: "slurm-pytorch-ddp-pretraining",
        title: "从 Slurm 到 PyTorch DDP：分布式预训练流程笔记",
        summary:
          "多机多卡 DDP 主线：Slurm 启进程、NCCL 组网、按 rank 分片数据、DDP 梯度同步、累积与 no_sync、rank 0 与 all_reduce 聚合指标。",
        cover: withBase("/images/blog-covers/slurm-pytorch-ddp-pretraining.png"),
        badge: "Technical",
      },
      {
        id: "learning-mcmc-ising",
        title: "通过 Ising 模型学习 MCMC",
        summary:
          "用 Ising 模型直观理解 Metropolis、Gibbs 采样与精确采样（CFTP）的实践型入门。",
        cover: withBase("/images/blog-covers/learning-mcmc-ising.png"),
        badge: "Technical",
      },
      {
        id: "why-write-a-blog",
        title: "为什么写博客",
        summary: "以前我一直觉得，写博客这件事离我挺远的。",
        cover: withBase("/images/blog-covers/why-write-a-blog.png"),
        badge: "Personal",
      },
    ],
  },
  now: {
    tocLabel: "近况",
    title: "近况",
    items: [
      {
        id: "shipping",
        title: "正在打磨个人主页",
        description:
          "把项目、经历和联系方式整理成一个更清晰的入口，让来访者能快速了解我正在构建什么。",
        badge: "迭代中",
        icon: "code-dots",
      },
      {
        id: "learning",
        title: "持续学习现代 Web 工程",
        description:
          "重点关注 React、TypeScript、动画交互、服务端能力和工程化体验，边做项目边沉淀方法。",
        badge: "学习中",
        icon: "book",
      },
      {
        id: "direction",
        title: "寻找前端 / 全栈实习机会",
        description:
          "希望加入重视产品体验与工程质量的团队，参与真实业务场景并承担可交付的功能模块。",
        badge: "开放沟通",
        icon: "target",
      },
    ],
  },
  resume: {
    tocLabel: "简历",
    title: "简历",
    badges: {
      available: "实习机会开放",
      updated: "2026 春季更新",
    },
    description: "点击查看我的简历（CV），快速了解我的经历。",
    viewLabel: "查看简历",
  },
  gallery: {
    tocLabel: "相册",
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
    tocLabel: "趣味事实",
    title: "Fun Facts",
    items: [
      "I’m a Cities: Skylines addict — I can spend hours designing and tuning virtual cities until (almost) everything works.",
      "I secretly enjoy traffic jams… as long as I’m not in a hurry. Watching congestion emerge in a simulation is strangely satisfying (and educational).",
      "I love architecture and urban design. Between the ages of 8 and 15, I created 200+ building designs for my own imaginary cities—long before I knew what a real city planner does.",
      "I’m a loyal NBA Golden State Warriors fan.",
      "I’m also a Chelsea FC supporter in the Premier League.",
    ],
  },
  newsletter: {
    tocLabel: "订阅",
    title: "订阅通讯",
    formLabel: "订阅通讯表单",
    emailLabel: "邮箱地址",
    placeholder: "输入你的邮箱",
    submitLabel: "订阅",
    successMessage: "已记录，感谢订阅。",
    errors: {
      required: "请输入邮箱地址。",
      invalid: "请输入有效的邮箱地址。",
    },
  },
  introduction: {
    tocLabel: "引言",
    quote:
      "Learning deeply and staying genuinely curious about the world.\nBecoming better at turning data into understanding and insight.\nBuilding things — models, systems, or ideas — that are both useful and meaningful.",
    author: "Xinxian Ma",
  },
} satisfies SiteContent["home"];

const projects: ProjectMap<ProjectSlug> = {
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
    // TODO: 占位文案，需要替换成 Zip2Zip 的真实介绍。
    cover: withBase("/images/projects/zip2zip.png"),
    name: "Zip2Zip Compression",
    summary: "面向大语言模型训练与推理的压缩感知分词方法。",
    intro: "面向大语言模型训练与推理的压缩感知分词方法。",
    detail: "面向大语言模型训练与推理的压缩感知分词方法。",
    status: "online",
    stack: [],
    links: {
      demo: "https://zip2zip-tokenizer-main-zygo.vercel.app/",
    },
  },
};

const ui = {
  common: {
    copy: "复制",
    copied: "已复制",
    backToTop: "回到顶部",
    status: {
      building: "开发中",
      online: "已上线",
      beta: "内测中",
      concept: "概念阶段",
    },
    links: {
      github: "GitHub",
      readme: "README",
      issues: "Issues",
      demo: "演示",
      website: "官网",
    },
  },
  projectDetail: {
    title: "项目",
    tabsLabel: "项目详情分区",
    tabs: {
      overview: "概览",
      readme: "README",
      website: "仓库",
    },
    cloneProtocols: {
      https: "HTTPS",
      ssh: "SSH",
      cli: "GitHub CLI",
    },
    stackTitle: "技术栈",
    readmeEnterFullscreen: "展开 README",
    readmeExitFullscreen: "收起 README",
    readmeLoading: "正在加载 README...",
    readmeError: "README 加载失败。",
    cloneDescription: "使用当前选中的命令克隆这个仓库。",
    downloadZip: "下载 ZIP",
    websiteUnavailable: "仓库链接不可用。",
  },
  settings: {
    buttonAria: "打开设置菜单",
    menuLabel: "设置",
    themeLabel: "主题",
    dividerLabel: "分割线",
    languageLabel: "语言",
    dividerPresets: "选择样式",
    themeOptions: {
      light: "浅色",
      dark: "深色",
    },
    dividerOptions: {
      "double-solid": "双实线",
      "single-dashed": "单虚线",
      "soft-fade": "柔光渐隐",
      "dot-chain": "点阵链线",
      hairline: "极细线",
      "dash-dot": "点划线",
      "center-glow": "中心微光",
      "woven-grid": "编织网格",
    },
    languageOptions: {
      "en-US": "英文",
      "zh-CN": "中文",
    },
  },
  notFound: {
    eyebrow: "页面未找到",
    description: "你要找的页面悄悄溜走了。这里没有出错，只是它暂时不在这里。",
  },
  errorBoundary: {
    oops: "出了点问题",
    unexpectedDescription: "发生了一个意外错误。",
    errorTitle: "错误",
    notFoundDescription: "你请求的页面不存在。",
  },
  scrollAnchor: {
    label: "首页模块导航",
    title: "本页目录",
  },
  actions: {
    sendEmail: "发送邮件",
    reserve: "预约沟通",
    accountPrefix: "这里是我的",
    accountHighlight: "社交账号",
  },
} satisfies SiteContent["ui"];

const content = {
  home,
  projects,
  ui,
} satisfies SiteContent<ProjectSlug>;

export default content;
