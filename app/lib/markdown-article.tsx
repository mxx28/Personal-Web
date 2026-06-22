import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";
import { withBase } from "@/utils/asset";
import type { SiteLanguage } from "@/types";

export type MarkdownFrontmatter = {
  title?: string;
  date?: string;
  description?: string;
};

export const markdownArticleComponents: Components = {
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
  blockquote: ({ node: _node, ...props }) => (
    <blockquote
      className="border-l-4 border-primary/35 py-0.5 pl-4 text-muted-foreground italic"
      {...props}
    />
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

export function parseMarkdownFrontmatter(markdown: string): {
  frontmatter: MarkdownFrontmatter;
  body: string;
} {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontmatter: {}, body: markdown };

  const raw = match[1];
  const frontmatter: MarkdownFrontmatter = {};

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

export function getEstimatedReadingMinutes(markdown: string, locale: SiteLanguage) {
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
