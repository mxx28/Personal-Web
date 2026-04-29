import { IconQuoteOpen } from "@tabler/icons-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEffect, useMemo, useState } from "react";

export default function Introduction() {
  const {
    home: { introduction },
  } = useSiteContent();

  const slides = useMemo(() => {
    const parts = introduction.quote
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    return parts.length > 0 ? parts : [introduction.quote];
  }, [introduction.quote]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="group relative flex flex-col items-center overflow-hidden py-4 px-2 text-center sm:py-6 sm:px-4">
      <IconQuoteOpen className="size-12" />
      <blockquote className="relative z-10 max-w-2xl px-1 sm:px-4">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((q) => (
              <div key={q} className="min-w-full px-0">
                <p className="text-balance text-xl font-semibold leading-7 text-title sm:text-3xl">
                  "{q}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </blockquote>
      <div className="z-10 mt-6 flex items-center gap-3 sm:mt-8">
        <div className="h-px w-8 bg-muted-foreground"></div>
        <span className=" text-xs font-medium uppercase text-muted-foreground sm:text-sm">
          {introduction.author}
        </span>
        <div className="h-px w-8 bg-muted-foreground"></div>
      </div>
    </div>
  );
}
