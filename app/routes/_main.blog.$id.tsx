import { useEffect, useMemo, useState } from "react";
import {
  useParams,
  ScrollRestoration,
  Link,
  Navigate,
  useLocation,
  useViewTransitionState,
} from "react-router";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import SectionFrame from "@/components/Center/SectionFrame";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconChevronLeft } from "@tabler/icons-react";
import { TransitionImage } from "@/components/TransitionImage";
import { ModeToggle } from "@/components/ModeToggle";
import { useLanguage } from "@/provider/language-provider";
import { withBase } from "@/utils/asset";
import type { SiteLanguage } from "@/types";

const markdownComponents: Components = {
  h1: ({ node: _node, ...props }) => (
    <h1 className="text-2xl font-bold tracking-tight text-title" {...props} />
  ),
  h2: ({ node: _node, ...props }) => (
    <h2 className="mt-6 text-xl font-semibold text-title" {...props} />
  ),
  h3: ({ node: _node, ...props }) => (
    <h3 className="mt-4 text-lg font-semibold text-title" {...props} />
  ),
  p: ({ node: _node, ...props }) => (
    <p className="leading-relaxed text-foreground/90" {...props} />
  ),
  a: ({ node: _node, ...props }) => (
    <a
      className="font-medium text-primary underline underline-offset-4"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  ul: ({ node: _node, ...props }) => (
    <ul className="flex list-disc flex-col gap-1 pl-5" {...props} />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol className="flex list-decimal flex-col gap-1 pl-5" {...props} />
  ),
  li: ({ node: _node, ...props }) => <li className="leading-relaxed" {...props} />,
  code: ({ node: _node, className, ...props }) => (
    <code
      className={cn(
        "rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ node: _node, ...props }) => (
    <pre
      className="overflow-x-auto rounded-lg border border-border bg-muted p-3 text-sm"
      {...props}
    />
  ),
  hr: ({ node: _node, ...props }) => (
    <hr className="my-8 border-0 border-t border-border/55 sm:my-10" {...props} />
  ),
  img: ({ node: _node, src, alt, className, ...props }) => (
    <img
      alt={alt ?? ""}
      className={cn("my-4 w-full max-w-2xl rounded-lg border border-border/60 bg-muted/20", className)}
      loading="lazy"
      decoding="async"
      {...props}
      src={src ? withBase(src) : undefined}
    />
  ),
};

type Frontmatter = {
  title?: string;
  date?: string;
  description?: string;
};

function parseFrontmatter(markdown: string): { frontmatter: Frontmatter; body: string } {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontmatter: {}, body: markdown };

  const raw = match[1];
  const frontmatter: Frontmatter = {};

  for (const line of raw.split("\n")) {
    const m = line.match(/^(\w+):\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    const value = m[2].replace(/^['"]|['"]$/g, "");
    if (key === "title") frontmatter.title = value;
    if (key === "date") frontmatter.date = value;
    if (key === "description") frontmatter.description = value;
  }

  return { frontmatter, body: markdown.slice(match[0].length) };
}

function getEstimatedReadingMinutes(markdown: string, locale: SiteLanguage) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, " ");
  const withoutInlineCode = withoutCode.replace(/`[^`]*`/g, " ");
  const withoutLinks = withoutInlineCode.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const withoutMath = withoutLinks.replace(/\$\$[\s\S]*?\$\$|\$[^$]*\$/g, " ");
  const withoutHeadings = withoutMath.replace(/^#{1,6}\s+/gm, "");
  const text = withoutHeadings
    .replace(/[*_~>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return null;

  const cjkChars = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  if (locale === "zh-CN" && cjkChars > 40) {
    return Math.max(1, Math.ceil(cjkChars / 400));
  }

  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogDetailRoute() {
  const { id } = useParams();
  const { locale } = useLanguage();
  const location = useLocation();
  const coverFromState = (location.state as { cover?: string } | null)?.cover;
  const href = id ? `/blog/${id}` : "/blog";
  const isBlogTransitioning = useViewTransitionState(href);
  const transitionName = id && isBlogTransitioning ? `blog-cover-${id}` : "none";

  const [raw, setRaw] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    async function run() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const paths =
          locale === "zh-CN"
            ? [`/blogs/${id}.zh.md`, `/blogs/${id}.md`]
            : [`/blogs/${id}.md`];
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
        setError("Blog post not found.");
      } finally {
        if (current) setLoading(false);
      }
    }
    run();
    return () => {
      current = false;
    };
  }, [id, locale]);

  const parsed = useMemo(() => parseFrontmatter(raw), [raw]);
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

  const articleMarkdownComponents = useMemo(() => {
    if (id !== "why-write-a-blog") {
      return markdownComponents;
    }
    return {
      ...markdownComponents,
      hr: () => (
        <div
          className="h-6 shrink-0 sm:h-8"
          aria-hidden
          role="presentation"
        />
      ),
    };
  }, [id]);

  if (id === "blog-federated-visualization") {
    return (
      <>
        <ScrollRestoration />
        <Navigate to="/blog/why-write-a-blog" replace state={location.state} />
      </>
    );
  }

  return (
    <>
      <ScrollRestoration />

      <SectionFrame>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 text-lg font-semibold leading-tight text-title">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link
                to="/"
                viewTransition
                state={id ? { viewTransitionBlogId: id } : undefined}
              >
                <IconChevronLeft data-icon="inline-start" />
              </Link>
            </Button>
            Blogs
          </div>

          <ModeToggle />
        </div>
      </SectionFrame>

      {coverFromState ? (
        <SectionFrame>
          <div className="p-4">
            <TransitionImage
              transitionName={transitionName}
              src={coverFromState}
              alt={parsed.frontmatter.title ?? "Blog cover"}
            />
          </div>
        </SectionFrame>
      ) : null}

      <SectionFrame>
        <article className="px-4 py-6 sm:py-8">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-title sm:text-3xl">
              {parsed.frontmatter.title ?? id}
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

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : error ? (
            <p className="text-sm text-muted-foreground">{error}</p>
          ) : (
            <div className="flex max-w-none flex-col gap-3 text-sm">
              <ReactMarkdown
                components={articleMarkdownComponents}
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

