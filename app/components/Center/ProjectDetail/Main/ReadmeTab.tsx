import { useEffect, useState } from "react";
import { IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { TabsContent } from "@/components/ui/tabs";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { Language } from "@/provider/language-provider";
import { cn } from "@/lib/utils";
import type { ProjectSlug } from "@/content";
import { withBase } from "@/utils/asset";

type ReadmeTabProps = {
  locale: Language;
  slug: ProjectSlug;
};

const markdownComponents: Components = {
  h1: ({ node: _node, ...props }) => (
    <h1 className="text-2xl font-bold tracking-tight text-title" {...props} />
  ),
  h2: ({ node: _node, ...props }) => (
    <h2 className="mt-4 text-xl font-semibold text-title" {...props} />
  ),
  h3: ({ node: _node, ...props }) => (
    <h3 className="mt-3 text-lg font-semibold text-title" {...props} />
  ),
  p: ({ node: _node, ...props }) => (
    <p className="leading-relaxed text-primary" {...props} />
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
    <ul
      className="flex list-disc flex-col gap-1 pl-5 text-primary"
      {...props}
    />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol
      className="flex list-decimal flex-col gap-1 pl-5 text-primary"
      {...props}
    />
  ),
  li: ({ node: _node, ...props }) => (
    <li className="leading-relaxed" {...props} />
  ),
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
};

export function ReadmeTab({ locale, slug }: ReadmeTabProps) {
  const { ui } = useSiteContent();
  const [markdown, setMarkdown] = useState("");
  const [isMarkdownLoading, setIsMarkdownLoading] = useState(true);
  const [markdownError, setMarkdownError] = useState<string | null>(null);
  const [isReadmeFullscreen, setIsReadmeFullscreen] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const markdownPaths = ["_cn", ""]
      .filter((suffix) => locale === "zh-CN" || suffix === "")
      .map((suffix) => withBase(`/markdown/${slug}${suffix}.md`));

    async function loadMarkdown() {
      setIsMarkdownLoading(true);
      setMarkdownError(null);

      try {
        const nextMarkdown = await fetchFirstMarkdown(markdownPaths);

        if (!isCurrent) {
          return;
        }

        setMarkdown(nextMarkdown);
      } catch {
        if (!isCurrent) {
          return;
        }

        setMarkdown("");
        setMarkdownError(ui.projectDetail.readmeError);
      } finally {
        if (isCurrent) {
          setIsMarkdownLoading(false);
        }
      }
    }

    loadMarkdown();

    return () => {
      isCurrent = false;
    };
  }, [locale, slug, ui.projectDetail.readmeError]);

  const renderReadmeContent = () =>
    isMarkdownLoading ? (
      <p className="text-sm text-muted-foreground">
        {ui.projectDetail.readmeLoading}
      </p>
    ) : markdownError ? (
      <p className="text-sm text-muted-foreground">{markdownError}</p>
    ) : (
      <article className="flex max-w-none flex-col gap-3 overflow-hidden text-sm">
        <ReactMarkdown components={markdownComponents}>{markdown}</ReactMarkdown>
      </article>
    );

  return (
    <TabsContent value="readme">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="pointer-events-auto bg-background/70 backdrop-blur"
            aria-label={ui.projectDetail.readmeEnterFullscreen}
            onClick={() => setIsReadmeFullscreen(true)}
          >
            <IconArrowsMaximize data-icon="inline-start" />
          </Button>
        </div>

        <div className="p-4 pt-12">{renderReadmeContent()}</div>
      </div>

      <Dialog open={isReadmeFullscreen} onOpenChange={setIsReadmeFullscreen}>
        <DialogContent
          showCloseButton={false}
          className="inset-0 top-0 left-0 block h-dvh max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none bg-background p-0 text-foreground ring-0 duration-200 no-scrollbar data-closed:slide-out-to-bottom-2 data-open:slide-in-from-bottom-2 sm:max-w-none"
        >
          <DialogTitle className="sr-only">
            {ui.projectDetail.tabs.readme}
          </DialogTitle>

          <div className="pointer-events-none sticky inset-x-0 top-0 z-10 flex justify-end p-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className="pointer-events-auto bg-background/70 backdrop-blur"
                aria-label={ui.projectDetail.readmeExitFullscreen}
              >
                <IconArrowsMinimize data-icon="inline-start" />
              </Button>
            </DialogClose>
          </div>

          <div className="mx-auto max-w-4xl px-5 pb-10 sm:px-8">
            {renderReadmeContent()}
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}

async function fetchFirstMarkdown(paths: string[]) {
  for (const path of paths) {
    const response = await fetch(path);

    if (response.ok) {
      return response.text();
    }
  }

  throw new Error("Markdown file not found.");
}
