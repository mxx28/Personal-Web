import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionHeader from "@/components/Center/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { useSiteContent } from "@/hooks/useSiteContent";
import { IconBrandGithub, IconFileText } from "@tabler/icons-react";

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
          <a href={href!} target="_blank" rel="noreferrer">
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

function Abstract({ text }: { text?: string }) {
  if (!text?.trim()) return null;
  const paragraphs = text.split(/\n\s*\n/g).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 text-sm leading-7 text-muted-foreground">
      {paragraphs.map((p, idx) => (
        <p key={idx}>{p}</p>
      ))}
    </div>
  );
}

function RepoLinks({
  links,
}: {
  links?: Partial<Record<"pdf" | "arxiv" | "code" | "project", string>>;
}) {
  if (!links) return null;
  const entries = Object.entries(links).filter(([, href]) => href?.trim());
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
      {entries.map(([key, href]) => (
        <a
          key={key}
          href={href!}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          {key.toUpperCase()}: {href}
        </a>
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
          <Accordion type="single" collapsible>
            {publications.items.map((pub, index) => (
              <div key={pub.id}>
                <AccordionItem
                  value={pub.id}
                  className="group px-4 transition-colors hover:bg-muted/30 not-last:border-b-0"
                >
                  <AccordionTrigger className="py-4 hover:no-underline">
                    <div className="flex w-full flex-col text-left">
                      <div className="flex w-full items-start justify-between gap-4 pr-2 transition-all duration-300 group-hover:-translate-y-1">
                        <div className="flex min-w-0 flex-col gap-1 text-left">
                          <div className="text-sm font-semibold leading-snug text-title">
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
                            <div className="relative h-24 w-40 overflow-hidden rounded-xl border border-border p-1">
                              <img
                                src={pub.cover}
                                alt={`${pub.title} cover`}
                                className="block size-full rounded-lg object-cover"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-4">
                    <div className="pt-2">
                      <div className="pb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Overview
                      </div>
                      {pub.topics?.length ? (
                        <div className="pb-3">
                          <div className="flex flex-wrap gap-1.5">
                            {pub.topics.map((tag) => (
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
                      <Abstract text={pub.abstract} />
                      {pub.links ? (
                        <div className="pt-4">
                          <RepoLinks links={pub.links} />
                        </div>
                      ) : null}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                {index < publications.items.length - 1 && (
                  <div className="double-divider" />
                )}
              </div>
            ))}
          </Accordion>
        )}
      </div>
    </>
  );
}

