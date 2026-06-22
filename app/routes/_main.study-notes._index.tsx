import { ScrollRestoration, Link } from "react-router";
import SectionFrame from "@/components/Center/SectionFrame";
import { Button } from "@/components/ui/button";
import { IconChevronLeft } from "@tabler/icons-react";
import { ModeToggle } from "@/components/ModeToggle";
import { studyNotesCatalog } from "@/content/study-notes-catalog";
import { useLanguage } from "@/provider/language-provider";

export default function StudyNotesIndexRoute() {
  const { locale } = useLanguage();
  const title = locale === "zh-CN" ? "学习笔记" : "Study notes";
  const subtitle =
    locale === "zh-CN"
      ? "这里整理课程笔记，也记录我近期自学的新知识点、论文理解与技术备忘。"
      : "A mix of course notes and self-study writeups on concepts, papers, and technical ideas I'm currently learning.";

  const courses = Object.entries(studyNotesCatalog);

  return (
    <>
      <ScrollRestoration />

      <SectionFrame>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 text-lg font-semibold leading-tight text-title">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to="/" viewTransition>
                <IconChevronLeft data-icon="inline-start" />
              </Link>
            </Button>
            {title}
          </div>
          <ModeToggle />
        </div>
      </SectionFrame>

      <SectionFrame>
        <div className="px-4 py-6 sm:py-8">
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          <ul className="flex flex-col gap-3">
            {courses.map(([id, course]) => (
              <li key={id}>
                <Link
                  to={`/study-notes/${id}`}
                  viewTransition
                  className="block rounded-lg border border-border/60 bg-muted/15 px-4 py-3 transition-colors hover:bg-muted/35"
                >
                  <span className="block text-base font-semibold text-foreground">{course.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{course.listSummary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </SectionFrame>
    </>
  );
}
