import { ScrollRestoration, Link, useLocation, useParams } from "react-router";
import { IconChevronLeft, IconBrandGithub, IconFileText } from "@tabler/icons-react";
import SectionFrame from "@/components/Center/SectionFrame";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransitionImage } from "@/components/TransitionImage";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Fragment } from "react";

function AuthorsLine({ authors }: { authors: string }) {
  const parts = authors
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="text-sm italic text-muted-foreground">
      {parts.map((name, idx) => (
        <span key={`${name}-${idx}`}>{idx > 0 ? `, ${name}` : name}</span>
      ))}
    </div>
  );
}

function Abstract({ text }: { text?: string }) {
  if (!text?.trim()) return null;
  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 text-sm leading-7 text-foreground/90">
      {paragraphs.map((p, idx) => (
        <p key={idx}>{p}</p>
      ))}
    </div>
  );
}

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
    <div className="flex flex-wrap gap-2">
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

export default function PublicationDetailRoute() {
  const { id = "" } = useParams();
  const location = useLocation();
  const coverFromState = (location.state as { cover?: string } | null)?.cover;

  const {
    home: { publications },
  } = useSiteContent();
  const pub = publications.items.find((x) => x.id === id);

  return (
    <>
      <ScrollRestoration />

      <SectionFrame>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 text-lg font-semibold leading-tight text-title">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to="/" viewTransition state={id ? { viewTransitionPublicationId: id } : undefined}>
                <IconChevronLeft data-icon="inline-start" />
              </Link>
            </Button>
            Publications
          </div>
        </div>
      </SectionFrame>

      {coverFromState ? (
        <SectionFrame>
          <div className="p-4">
            <TransitionImage
              transitionName={id ? `publication-cover-${id}` : "none"}
              src={coverFromState}
              alt={pub?.title ?? "Publication cover"}
            />
          </div>
        </SectionFrame>
      ) : null}

      <SectionFrame>
        {!pub ? (
          <div className="px-4 py-8">
            <p className="text-sm text-muted-foreground">Publication not found.</p>
          </div>
        ) : (
          <article className="px-4 py-6 sm:py-8">
            <div className="mb-6 flex flex-col gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-title sm:text-3xl">
                {pub.title}
              </h1>
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
              {pub.links ? (
                <div className="pt-1">
                  <PublicationLinks links={pub.links} />
                </div>
              ) : null}
            </div>

            <Tabs defaultValue="overview" className="contents">
              <TabsList
                aria-label="Publication detail tabs"
                variant="line"
                className="flex h-9 w-full min-w-0 rounded-none bg-transparent p-0 px-1.5 text-foreground"
              >
                {[
                  { value: "overview", label: "Overview" },
                  { value: "resources", label: "Resources" },
                ].map((tab, index) => (
                  <Fragment key={tab.value}>
                    {index > 0 && <Separator orientation="vertical" />}
                    <TabsTrigger
                      value={tab.value}
                      className="min-w-0 flex-1 basis-0 rounded-none data-active:bg-transparent data-active:text-foreground"
                    >
                      {tab.label}
                    </TabsTrigger>
                  </Fragment>
                ))}
              </TabsList>

              <div className="pt-5" />

              <TabsContent value="overview" className="mt-0">
                <div className="flex flex-col gap-3">
                  {pub.topics?.length ? (
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
                  ) : null}
                  <Abstract text={pub.abstract} />
                </div>
              </TabsContent>

              <TabsContent value="resources" className="mt-0">
                <div />
              </TabsContent>
            </Tabs>
          </article>
        )}
      </SectionFrame>
    </>
  );
}
