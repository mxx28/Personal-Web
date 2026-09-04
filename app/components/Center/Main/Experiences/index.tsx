import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import SectionHeader from "@/components/Center/SectionHeader";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { ExperienceEntry } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Fragment, useMemo, useState } from "react";

// Expand/collapse is temporarily disabled; the per-item highlights/tags
// content below is kept in place in case it's turned back on later.
const experienceExpandEnabled = false;

function ExperienceItem({ experience }: { experience: ExperienceEntry }) {
  return (
    <AccordionItem
      value={experience.id}
      disabled={!experienceExpandEnabled}
      className="group px-4 transition-colors hover:bg-muted/30 not-last:border-b-0"
    >
      <AccordionTrigger
        className={
          experienceExpandEnabled
            ? "py-4 hover:no-underline"
            : "py-4 hover:no-underline disabled:opacity-100 [&_[data-slot=accordion-trigger-icon]]:hidden"
        }
      >
        <div className="flex w-full items-start justify-between gap-4 pr-2 transition-all duration-300 group-hover:-translate-y-1">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-15 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/25">
              {experience.logoSrc ? (
                <div className="flex size-11 items-center justify-center rounded-xl bg-background/70 p-1.5">
                  <picture>
                    {experience.logoDarkSrc ? (
                      <source
                        srcSet={experience.logoDarkSrc}
                        media="(prefers-color-scheme: dark)"
                      />
                    ) : null}
                    <img
                      src={experience.logoSrc}
                      alt={experience.logoAlt ?? `${experience.organization} logo`}
                      className="size-full object-contain"
                      loading="lazy"
                    />
                  </picture>
                </div>
              ) : (
                <div className=" flex size-11 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                  {experience.logoText}
                </div>
              )}
            </div>

            <div className="min-w-0 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className=" text-lg font-semibold leading-none">
                  {experience.organization}
                </h3>
                {experience.employmentType ? (
                  <Badge variant="outline" className="">
                    {experience.employmentType}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {experience.role}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right text-sm text-muted-foreground">
            <p className="text-sm font-semibold text-foreground/80">
              {experience.period}
            </p>
            <p className="text-sm text-muted-foreground">{experience.location}</p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        {experience.tags?.length ? (
          <div className="pb-2 pl-3 md:pl-5">
            <div className="flex flex-wrap gap-1.5">
              {experience.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="h-5 px-2 py-0 text-[0.625rem] border-border/60 bg-secondary/80 [&>svg]:size-2.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        <ul className="flex flex-col gap-2.5 pb-2 pl-3 text-sm leading-7 text-muted-foreground md:pl-5">
          {experience.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}

export function ExperienceList({
  title,
  items,
}: {
  title: string;
  items: ExperienceEntry[];
}) {
  const [filter, setFilter] = useState<"research" | "internship">("research");

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      if (item.hidden) return false;
      if (!item.kind) return true;
      return item.kind === filter;
    });
  }, [filter, items]);

  return (
    <>
      <SectionHeader>{title}</SectionHeader>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList
          aria-label="Experience filters"
          variant="line"
          className="mt-1 flex h-11 w-full min-w-0 rounded-none bg-transparent p-0 px-2 text-foreground sm:h-12"
        >
          {[
            { value: "research", label: "Research" },
            { value: "internship", label: "Internship" },
          ].map((tab, index) => (
            <Fragment key={tab.value}>
              {index > 0 && <Separator orientation="vertical" />}
              <TabsTrigger
                value={tab.value}
                className="min-w-0 flex-1 basis-0 rounded-none py-2.5 text-sm data-active:bg-transparent data-active:text-foreground sm:py-3"
              >
                {tab.label}
              </TabsTrigger>
            </Fragment>
          ))}
        </TabsList>
      </Tabs>

      <div className="pt-2" />
      <Accordion type="single" collapsible>
        {visibleItems.map((experience, index) => (
          <div key={experience.id}>
            <ExperienceItem experience={experience} />
            {index < visibleItems.length - 1 && (
              <div className="double-divider" />
            )}
          </div>
        ))}
      </Accordion>
    </>
  );
}

export default function Experiences() {
  const {
    home: { experiences },
  } = useSiteContent();

  return <ExperienceList title={experiences.title} items={experiences.items} />;
}
