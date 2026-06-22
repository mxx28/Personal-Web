/** Static catalog for study-note routes (collection → note list). */
export type StudyNoteLectureMeta = {
  id: string;
  title: string;
  summary: string;
  githubPdfUrl?: string;
};

export type StudyNoteCourseMeta = {
  title: string;
  /** Hero image under the nav (path under public, leading slash). */
  bannerSrc?: string;
  /** Optional external reference link. */
  officialUrl?: string;
  /** Opening blurb for the collection. */
  introLead: string;
  /** Short personal line (localized). */
  introPersonalEn: string;
  introPersonalZh: string;
  /** One line for the /study-notes hub list. */
  listSummary: string;
  notes: StudyNoteLectureMeta[];
};

export const studyNotesCatalog: Record<string, StudyNoteCourseMeta> = {
  "cs336-spring2025": {
    title: "Stanford CS336 Spring-2025",
    bannerSrc: "/images/study-notes/cs336-spring2025-banner.png",
    officialUrl: "https://cs336.stanford.edu/spring2025/",
    introLead:
      "This course is designed to provide students with a comprehensive understanding of language models by walking them through the entire process of developing their own.",
    introPersonalEn: "Below are my personal notes.",
    introPersonalZh: "下面是我的个人笔记。",
    listSummary: "Stanford CS336 · Language Modeling from Scratch (Spring 2025)",
    notes: [
      {
        id: "lecture-3-architecture",
        title: "Lecture 3 — Architecture",
        summary:
          "Transformer vs modern LLaMA-style stacks: pre-norm, RMSNorm, RoPE, gated FFNs, stability tricks, and efficient attention.",
        githubPdfUrl:
          "https://github.com/stanford-cs336/spring2025-lectures/blob/e9cb2488fdb53ea37f0e38924ec3a1701925cef3/nonexecutable/2025%20Lecture%203%20-%20architecture.pdf",
      },
      {
        id: "lecture-4-moe",
        title: "Lecture 4 — Mixture of Experts (MoE)",
        summary:
          "Sparse activation at scale: top‑k routing, load balancing, shared/fine‑grained experts, stability tricks, and systems trade-offs.",
        githubPdfUrl:
          "https://github.com/stanford-cs336/spring2025-lectures/blob/98455ec198c9a88ec1ab2b1c4058662431b54ce3/nonexecutable/2025%20Lecture%204%20-%20MoEs.pdf",
      },
    ],
  },
  "self-study-notes": {
    title: "Self Study Notes",
    introLead:
      "A personal notebook for concepts, papers, and engineering ideas I am learning in the moment.",
    introPersonalEn: "Each note is written to make a new idea easier to revisit later.",
    introPersonalZh: "这里的每篇笔记，都是为了把刚学到的新知识点整理得更容易回看。",
    listSummary: "Independent notes on newly learned concepts, papers, and systems ideas.",
    notes: [
      {
        id: "speculative-decoding",
        title: "Speculative Decoding: Let the Small Model Guess, Let the Big Model Judge",
        summary:
          "Why speculative decoding can accelerate autoregressive generation: draft vs target roles, verification logic, and the speed-acceptance trade-off.",
      },
    ],
  },
};

export function getStudyNoteCourse(courseId: string) {
  return studyNotesCatalog[courseId];
}
