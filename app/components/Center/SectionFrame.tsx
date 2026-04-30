import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { HomeSectionDepth } from "@/types";

type SectionFrameProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  innerClassName?: string;
  divider?: boolean;
  tocDepth?: HomeSectionDepth;
  tocLabel?: string;
  hideFromToc?: boolean;
};

export default function SectionFrame({
  children,
  className,
  id,
  innerClassName,
  divider = true,
  tocDepth = 2,
  tocLabel,
  hideFromToc = false,
}: SectionFrameProps) {
  return (
    <section
      id={id}
      data-toc-section={id && !hideFromToc ? "true" : undefined}
      data-toc-depth={id && !hideFromToc ? String(tocDepth) : undefined}
      data-toc-label={id && !hideFromToc ? tocLabel : undefined}
      className={cn("relative scroll-mt-4 bg-background", className)}
    >
      <div
        className={cn(
          "max-w-[var(--layout-content-max)] mx-2 sm:mx-8 md:mx-auto relative section-frame",
          innerClassName,
        )}
      >
        <div className="mx-[var(--divider-inline-size)] w-[calc(100%-var(--divider-inline-size)*2)] box-border">
          {children}
        </div>
      </div>

      {divider && <div className="double-divider" />}
    </section>
  );
}
