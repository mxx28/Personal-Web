import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import SectionHeader from "@/components/Center/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";

function StudyNoteCard({
  href,
  title,
  badge,
  summary,
  viewDetailsLabel,
}: {
  href: string;
  title: string;
  badge?: string;
  summary: string;
  viewDetailsLabel: string;
}) {
  return (
    <Link
      to={href}
      viewTransition
      className="group flex w-full flex-col p-4 text-left transition-colors hover:bg-muted/30 sm:p-6"
    >
      <div className="flex flex-col gap-2.5 px-2.5 transition-all duration-300 group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 truncate text-xl font-semibold leading-tight text-foreground">
            {title}
          </h3>

          {badge ? (
            <Badge variant="outline" className="shrink-0 bg-muted text-foreground">
              <span className="relative size-1.5 rounded-full bg-current before:absolute before:inset-0 before:animate-ping before:rounded-full before:bg-current" />
              <span>{badge}</span>
            </Badge>
          ) : null}
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{summary}</p>

        <span className="flex items-center gap-1 pt-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          {viewDetailsLabel}
          <IconArrowNarrowRight data-icon="inline-end" />
        </span>
      </div>
    </Link>
  );
}

export default function StudyNotes() {
  const {
    home: { studyNotes },
  } = useSiteContent();

  return (
    <>
      <SectionHeader>{studyNotes.title}</SectionHeader>
      <div className="px-4 pb-2">
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex snap-x snap-mandatory gap-4 md:gap-4">
            {studyNotes.items.map((item) => (
              <div
                key={item.id}
                className="w-full flex-shrink-0 snap-start md:w-[calc(50%-0.5rem)]"
              >
                <StudyNoteCard
                  href={`/study-notes/${item.id}`}
                  title={item.title}
                  badge={item.badge}
                  summary={item.summary}
                  viewDetailsLabel={studyNotes.viewDetailsLabel}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
