import { ScrollRestoration, Link, useParams } from "react-router";
import SectionFrame from "@/components/Center/SectionFrame";
import { Button } from "@/components/ui/button";
import {
  IconArrowNarrowRight,
  IconChevronLeft,
  IconWorldWww,
} from "@tabler/icons-react";
import { ModeToggle } from "@/components/ModeToggle";
import { getStudyNoteCourse } from "@/content/study-notes-catalog";
import { useLanguage } from "@/provider/language-provider";
import { withBase } from "@/utils/asset";

export default function StudyNotesCourseRoute() {
  const { courseId } = useParams();
  const { locale } = useLanguage();
  const course = courseId ? getStudyNoteCourse(courseId) : undefined;

  const notFound =
    locale === "zh-CN" ? "未找到该笔记集合。" : "Note collection not found.";
  const lectureLinkAria =
    locale === "zh-CN" ? "打开笔记" : "Open note";
  const officialSiteLabel =
    locale === "zh-CN"
      ? course?.officialUrl
        ? "课程网站"
        : "参考链接"
      : course?.officialUrl
        ? "Course website"
        : "Reference link";

  return (
    <>
      <ScrollRestoration />

      <SectionFrame>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex min-w-0 items-center gap-2 text-lg font-semibold leading-tight text-title">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to="/study-notes" viewTransition>
                <IconChevronLeft data-icon="inline-start" />
              </Link>
            </Button>
            <span className="truncate">{course?.title ?? courseId}</span>
          </div>
          <ModeToggle />
        </div>
      </SectionFrame>

      {course?.bannerSrc ? (
        <SectionFrame>
          <div className="px-4 pt-2 pb-4 sm:px-6">
            <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/10">
              <img
                src={withBase(course.bannerSrc)}
                alt={`${course.title} banner`}
                className="block w-full bg-background object-cover object-center"
              />
            </div>
          </div>
        </SectionFrame>
      ) : null}

      <SectionFrame>
        <div className="px-4 py-6 sm:px-6 sm:py-8">
          {!course ? (
            <p className="text-sm text-muted-foreground">{notFound}</p>
          ) : (
            <>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                {course.introLead}{" "}
                {locale === "zh-CN" ? course.introPersonalZh : course.introPersonalEn}
              </p>

              {course.officialUrl ? (
                <a
                  href={course.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-8 inline-flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted/40"
                >
                  <IconWorldWww className="size-4 shrink-0" aria-hidden />
                  <span>{officialSiteLabel}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="truncate underline underline-offset-2">{course.officialUrl}</span>
                </a>
              ) : null}

              <ul className="flex flex-col gap-2">
                {course.notes.map((note) => (
                  <li key={note.id}>
                    <Link
                      to={`/study-notes/${courseId}/${note.id}`}
                      viewTransition
                      aria-label={`${lectureLinkAria}: ${note.title}`}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/10 px-4 py-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="min-w-0">
                        <span className="block font-medium text-foreground">{note.title}</span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{note.summary}</span>
                      </div>
                      <span className="flex shrink-0 text-muted-foreground transition-colors group-hover:text-foreground">
                        <IconArrowNarrowRight className="size-5" aria-hidden />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </SectionFrame>
    </>
  );
}
