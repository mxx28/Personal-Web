import { useEffect, useMemo, useState } from "react";
import { ScrollRestoration, Link, useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import SectionFrame from "@/components/Center/SectionFrame";
import { Button } from "@/components/ui/button";
import { IconBrandGithub, IconChevronLeft } from "@tabler/icons-react";
import { ModeToggle } from "@/components/ModeToggle";
import { useLanguage } from "@/provider/language-provider";
import { withBase } from "@/utils/asset";
import {
  getEstimatedReadingMinutes,
  markdownArticleComponents,
  parseMarkdownFrontmatter,
} from "@/lib/markdown-article";
import { getStudyNoteCourse } from "@/content/study-notes-catalog";

export default function StudyNoteDetailRoute() {
  const { courseId, noteId } = useParams();
  const { locale } = useLanguage();
  const course = courseId ? getStudyNoteCourse(courseId) : undefined;
  const noteMeta = course?.notes.find((n) => n.id === noteId);

  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notFound =
    locale === "zh-CN" ? "笔记未找到。" : "Note not found.";
  const loadingLabel = locale === "zh-CN" ? "加载中…" : "Loading…";
  const githubPdfLabel = locale === "zh-CN" ? "GitHub PDF" : "GitHub PDF";

  useEffect(() => {
    let current = true;
    async function run() {
      if (!courseId || !noteId || !course || !noteMeta) {
        setLoading(false);
        setError(notFound);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const paths =
          locale === "zh-CN"
            ? [`/study-notes/${courseId}/${noteId}.zh.md`, `/study-notes/${courseId}/${noteId}.md`]
            : [`/study-notes/${courseId}/${noteId}.md`];
        let text = "";
        for (const path of paths) {
          const res = await fetch(withBase(path));
          if (res.ok) {
            text = await res.text();
            break;
          }
        }
        if (!text) throw new Error("not found");
        if (!current) return;
        setRaw(text);
      } catch {
        if (!current) return;
        setRaw("");
        setError(notFound);
      } finally {
        if (current) setLoading(false);
      }
    }
    run();
    return () => {
      current = false;
    };
  }, [course, courseId, locale, noteId, noteMeta, notFound]);

  const parsed = useMemo(() => parseMarkdownFrontmatter(raw), [raw]);
  const readingMinutes = useMemo(
    () => getEstimatedReadingMinutes(parsed.body, locale),
    [parsed.body, locale],
  );

  const readingTimeLabel =
    readingMinutes == null
      ? ""
      : locale === "zh-CN"
        ? `约 ${readingMinutes} 分钟阅读`
        : `${readingMinutes} min read`;

  const backHref = courseId ? `/study-notes/${courseId}` : "/study-notes";

  return (
    <>
      <ScrollRestoration />

      <SectionFrame>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex min-w-0 items-center gap-2 text-lg font-semibold leading-tight text-title">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to={backHref} viewTransition>
                <IconChevronLeft data-icon="inline-start" />
              </Link>
            </Button>
            <span className="truncate">{noteMeta?.title ?? noteId}</span>
          </div>
          <ModeToggle />
        </div>
      </SectionFrame>

      <SectionFrame>
        <article className="px-4 py-6 sm:py-8">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-title sm:text-3xl">
              {parsed.frontmatter.title ?? noteMeta?.title ?? noteId}
            </h1>
            {parsed.frontmatter.description ? (
              <p className="text-sm leading-7 text-muted-foreground">
                {parsed.frontmatter.description}
              </p>
            ) : null}
            {parsed.frontmatter.date ? (
              <p className="text-xs text-muted-foreground">
                {parsed.frontmatter.date}
                {readingTimeLabel ? ` · ${readingTimeLabel}` : ""}
              </p>
            ) : null}
            {!parsed.frontmatter.date && readingTimeLabel ? (
              <p className="text-xs text-muted-foreground">{readingTimeLabel}</p>
            ) : null}
          </div>

          {noteMeta?.githubPdfUrl ? (
            <div className="mb-6 flex">
              <a
                href={noteMeta.githubPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-muted/15 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted/35"
              >
                <IconBrandGithub className="size-4 shrink-0" aria-hidden />
                <span>{githubPdfLabel}</span>
              </a>
            </div>
          ) : null}

          {loading ? (
            <p className="text-sm text-muted-foreground">{loadingLabel}</p>
          ) : error ? (
            <p className="text-sm text-muted-foreground">{error}</p>
          ) : (
            <div className="flex max-w-none flex-col gap-3 text-sm">
              <ReactMarkdown
                components={markdownArticleComponents}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {parsed.body}
              </ReactMarkdown>
            </div>
          )}
        </article>
      </SectionFrame>
    </>
  );
}
