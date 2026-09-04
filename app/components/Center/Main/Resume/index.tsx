import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SectionHeader from "@/components/Center/SectionHeader";
import { IconArrowUpRight, IconFileText } from "@tabler/icons-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { siteConfig } from "@/site/config";

export default function Resume() {
  const {
    home: { resume },
  } = useSiteContent();

  return (
    <>
      <SectionHeader>{resume.title}</SectionHeader>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0 flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{resume.badges.available}</Badge>
              <Badge variant="outline">{resume.badges.updated}</Badge>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {resume.description}
            </p>
          </div>

          <Button size="lg" className="w-full shrink-0 sm:w-auto" asChild>
            <a href={siteConfig.resume.href} target="_blank" rel="noreferrer">
              <IconFileText data-icon="inline-start" />
              {resume.viewLabel}
              <IconArrowUpRight data-icon="inline-end" />
            </a>
          </Button>
        </div>
      </div>
    </>
  );
}
