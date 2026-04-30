import SectionHeader from "@/components/Center/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { useSiteContent } from "@/hooks/useSiteContent";
import { IconBrandGithub, IconFileText } from "@tabler/icons-react";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { Link, useViewTransitionState } from "react-router";
import { TransitionImage } from "@/components/TransitionImage";

function PublicationLinks({
  links,
}: {
  links?: Partial<Record<"pdf" | "arxiv" | "code" | "project", string>>;
}) {
  if (!links) return null;

  const entries = Object.entries(links).filter(([, href]) => href?.trim());
  if (entries.length === 0) return null;

  const labelMap: Record<string, string> = {
    pdf: "PDF",
    arxiv: "arXiv",
    code: "Code",
    project: "Project",
  };

  const iconMap: Partial<Record<string, React.ComponentType<{ className?: string }>>> =
    {
      arxiv: IconFileText,
      code: IconBrandGithub,
    };

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {entries.map(([key, href]) => (
        <Badge key={key} asChild variant="outline">
          <a
            href={href!}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {iconMap[key] ? (
              (() => {
                const Icon = iconMap[key]!;
                return <Icon data-icon="inline-start" />;
              })()
            ) : null}
            {labelMap[key] ?? key}
          </a>
        </Badge>
      ))}
    </div>
  );
}

function AuthorsLine({ authors }: { authors: string }) {
  const parts = authors
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="text-sm italic text-muted-foreground">
      {parts.map((name, idx) => {
        const isMe = name.toLowerCase() === "xinxian ma";

        return (
          <span key={`${name}-${idx}`}>
            {idx > 0 ? ", " : null}
            {isMe ? (
              <span className="border-b border-foreground/40 pb-[1px]">
                {name}
              </span>
            ) : (
              <span>{name}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function Publications() {
  const {
    home: { publications },
  } = useSiteContent();

  return (
    <>
      <SectionHeader>{publications.title}</SectionHeader>
      <div className="px-4 pb-2">
        {publications.items.length === 0 ? (
          <p className="text-sm leading-7 text-muted-foreground">
            Add your publications here.
          </p>
        ) : (
          <div>
            {publications.items.map((pub, index) => {
              const href = `/publication/${pub.id}`;
              return (
                <div key={pub.id}>
                  <Link
                    to={href}
                    viewTransition
                    state={{ cover: pub.cover }}
                    className="group relative block px-4 py-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  >
                    <div className="flex w-full items-start justify-between gap-4 pr-2 transition-all duration-300 group-hover:-translate-y-1">
                      <div className="flex min-w-0 flex-col gap-1 text-left">
                        <div className="text-sm font-semibold leading-snug text-title underline-offset-4 group-hover:underline">
                          {pub.title}
                        </div>
                        <AuthorsLine authors={pub.authors} />
                        {pub.tags?.length ? (
                          <div className="pt-1">
                            <div className="flex flex-wrap gap-1.5">
                              {pub.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="h-5 px-2 py-0 text-[0.625rem] border-border/60 bg-secondary/80"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        <PublicationLinks links={pub.links} />
                      </div>

                      {pub.cover ? (
                        <div className="hidden shrink-0 sm:block">
                          <PublicationCover
                            pubId={pub.id}
                            cover={pub.cover}
                            title={pub.title}
                          />
                        </div>
                      ) : null}
                    </div>

                    <span className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                      View details <IconArrowNarrowRight data-icon="inline-end" />
                    </span>
                  </Link>

                  {index < publications.items.length - 1 && (
                    <div className="double-divider" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function PublicationCover({
  pubId,
  cover,
  title,
}: {
  pubId: string;
  cover: string;
  title: string;
}) {
  const href = `/publication/${pubId}`;
  const isTransitioning = useViewTransitionState(href);
  const transitionName = isTransitioning ? `publication-cover-${pubId}` : "none";

  return (
    <div className="relative h-24 w-40 overflow-hidden rounded-xl border border-border p-1 md:h-32 md:w-52 lg:h-36 lg:w-60">
      <TransitionImage transitionName={transitionName} src={cover} alt={`${title} cover`} />
    </div>
  );
}

