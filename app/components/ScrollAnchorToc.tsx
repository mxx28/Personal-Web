import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getVisibleHomeSectionsFromDocument,
  type HomeSection,
  type HomeSectionId,
} from "@/site/home-sections";
import { useSiteContent } from "@/hooks/useSiteContent";
import { cn } from "@/lib/utils";

const itemHeight = 30;
const linePadding = 5;
const pathWidth = 48;

type LocalizedTocItem = HomeSection;
type ScrollToSection = (id: HomeSectionId) => void;

function getLineOffset(depth: number) {
  if (depth <= 2) {
    return 10;
  }

  return 24;
}

function getItemOffset(depth: number) {
  if (depth <= 2) {
    return 30;
  }

  return 52;
}

function getPosition(index: number, depth: HomeSection["depth"]) {
  const top = index * itemHeight + linePadding;
  const bottom = (index + 1) * itemHeight - linePadding;
  const x = getLineOffset(depth);

  return { bottom, top, x, y: top + (bottom - top) / 2 };
}

function buildPath(items: HomeSection[]) {
  return items
    .map((item, index) => {
      const { bottom, top, x } = getPosition(index, item.depth);

      if (index === 0) {
        return `M ${x} ${top} L ${x} ${bottom}`;
      }

      const previous = getPosition(index - 1, items[index - 1].depth);

      return `C ${previous.x} ${top - 6} ${x} ${previous.bottom + 6} ${x} ${top} L ${x} ${bottom}`;
    })
    .join(" ");
}

export function ScrollAnchorToc() {
  const { ui } = useSiteContent();
  const [items, setItems] = useState<LocalizedTocItem[]>([]);
  const [activeId, setActiveId] = useState<HomeSectionId | null>(null);
  const [progress, setProgress] = useState(0);
  const [isMobileTocExpanded, setIsMobileTocExpanded] = useState(false);
  const mobileTocIdleTimer = useRef<number | null>(null);
  const itemsRefreshFrame = useRef<number | null>(null);

  const path = useMemo(() => buildPath(items), [items]);
  const pathHeight = itemHeight * items.length;

  const expandMobileTocTemporarily = useCallback(() => {
    setIsMobileTocExpanded(true);

    if (mobileTocIdleTimer.current) {
      window.clearTimeout(mobileTocIdleTimer.current);
    }

    mobileTocIdleTimer.current = window.setTimeout(() => {
      setIsMobileTocExpanded(false);
    }, 1200);
  }, []);

  useEffect(() => {
    const syncItems = () => {
      const nextItems = getVisibleHomeSectionsFromDocument();
      setItems(nextItems);
      setActiveId((currentActiveId) => {
        if (nextItems.length === 0) {
          return null;
        }

        if (
          currentActiveId &&
          nextItems.some((item) => item.id === currentActiveId)
        ) {
          return currentActiveId;
        }

        return nextItems[0].id;
      });
    };

    const requestItemsSync = () => {
      if (itemsRefreshFrame.current !== null) {
        cancelAnimationFrame(itemsRefreshFrame.current);
      }

      itemsRefreshFrame.current = requestAnimationFrame(() => {
        itemsRefreshFrame.current = null;
        syncItems();
      });
    };

    syncItems();

    const observer = new MutationObserver(() => {
      requestItemsSync();
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        "data-toc-section",
        "data-toc-depth",
        "data-toc-label",
        "id",
      ],
    });

    return () => {
      observer.disconnect();
      if (itemsRefreshFrame.current !== null) {
        cancelAnimationFrame(itemsRefreshFrame.current);
      }
    };
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      setProgress(0);
      return;
    }

    let frameId = 0;

    const update = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      let nextActive: HomeSectionId = items[0].id;
      const viewportCenter = window.innerHeight / 2;
      let closestDistance = Number.POSITIVE_INFINITY;
      const topEdgeThreshold = 2;
      const bottomEdgeThreshold = 2;

      setProgress(
        maxScroll > 0
          ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1)
          : 0,
      );

      if (window.scrollY <= topEdgeThreshold) {
        setActiveId(items[0].id);
        return;
      }

      if (maxScroll - window.scrollY <= bottomEdgeThreshold) {
        setActiveId(items[items.length - 1].id);
        return;
      }

      for (const item of items) {
        const section = document.getElementById(item.id);
        if (!section) {
          continue;
        }

        const { top, bottom } = section.getBoundingClientRect();
        const distance =
          top <= viewportCenter && bottom >= viewportCenter
            ? 0
            : Math.min(
                Math.abs(top - viewportCenter),
                Math.abs(bottom - viewportCenter),
              );

        if (distance <= closestDistance) {
          closestDistance = distance;
          nextActive = item.id;
        }
      }

      setActiveId(nextActive);
    };

    const requestUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(update);
    };

    const handleScroll = () => {
      expandMobileTocTemporarily();
      requestUpdate();
    };

    requestUpdate();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [expandMobileTocTemporarily, items]);

  useEffect(() => {
    return () => {
      if (mobileTocIdleTimer.current) {
        window.clearTimeout(mobileTocIdleTimer.current);
      }
    };
  }, []);

  const scrollToSection: ScrollToSection = (id) => {
    const section = document.getElementById(id);
    if (!section) {
      return;
    }

    const sectionRect = section.getBoundingClientRect();
    const sectionTop = sectionRect.top + window.scrollY;
    const centeredTop =
      sectionTop - (window.innerHeight - sectionRect.height) / 2;
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0,
    );
    const top = Math.min(Math.max(centeredTop, 0), maxScroll);

    window.scrollTo({
      top,
      behavior: "smooth",
    });

    setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  if (items.length === 0 || activeId === null) {
    return null;
  }

  const activeIndex = Math.max(
    items.findIndex((item) => item.id === activeId),
    0,
  );
  const activePosition = getPosition(activeIndex, items[activeIndex].depth);
  const activeItem = items[activeIndex];
  const activeCount = `${activeIndex + 1}/${items.length}`;
  const anchorLabel = ui.scrollAnchor.label;

  return (
    <>
      <DesktopScrollAnchorToc
        activeId={activeId}
        activePosition={activePosition}
        anchorLabel={anchorLabel}
        items={items}
        path={path}
        pathHeight={pathHeight}
        title={ui.scrollAnchor.title}
        onSelect={scrollToSection}
      />

      <MobileScrollAnchorToc
        activeCount={activeCount}
        activeId={activeId}
        activeItem={activeItem}
        anchorLabel={anchorLabel}
        isExpanded={isMobileTocExpanded}
        items={items}
        progress={progress}
        onExpand={expandMobileTocTemporarily}
        onSelect={scrollToSection}
      />
    </>
  );
}

type DesktopScrollAnchorTocProps = {
  activeId: HomeSectionId;
  activePosition: ReturnType<typeof getPosition>;
  anchorLabel: string;
  items: LocalizedTocItem[];
  path: string;
  pathHeight: number;
  title: string;
  onSelect: ScrollToSection;
};

function DesktopScrollAnchorToc({
  activeId,
  activePosition,
  anchorLabel,
  items,
  path,
  pathHeight,
  title,
  onSelect,
}: DesktopScrollAnchorTocProps) {
  const activeTop = `${activePosition.top}px`;
  const activeBottom = `${activePosition.bottom}px`;

  return (
    <nav
      aria-label={anchorLabel}
      className="fixed top-52 z-50 hidden w-44 lg:block left-[max(1rem,calc((100vw-var(--layout-content-max))/2-12rem))]"
    >
      <div className="flex flex-col gap-2">
        <div className="flex h-7 items-center gap-3 text-sm text-muted-foreground">
          <span className=" text-sm font-semibold text-foreground/90">
            {title}
          </span>
        </div>

        <div className="relative">
          <div
            className="pointer-events-none absolute inset-y-0 inset-s-0"
            style={{ width: pathWidth, height: pathHeight }}
          >
            <svg
              aria-hidden="true"
              viewBox={`0 0 ${pathWidth} ${pathHeight}`}
              className="absolute inset-0 size-full overflow-visible"
            >
              <path
                d={path}
                fill="none"
                strokeWidth="1"
                strokeLinecap="round"
                className="stroke-border"
              />
            </svg>

            <svg
              aria-hidden="true"
              viewBox={`0 0 ${pathWidth} ${pathHeight}`}
              className="absolute inset-0 size-full overflow-visible transition-[clip-path] duration-200 ease-out"
              style={{
                clipPath: `polygon(0 ${activeTop}, 100% ${activeTop}, 100% ${activeBottom}, 0 ${activeBottom})`,
              }}
            >
              <path
                d={path}
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="stroke-primary"
              />
            </svg>

            <span
              aria-hidden="true"
              className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-[left,top] duration-200"
              style={{
                left: activePosition.x,
                top: activePosition.bottom,
              }}
            />
          </div>

          <div className="flex flex-col">
            {items.map((item) => {
              const isActive = activeId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "flex h-7.5 items-center rounded-md pr-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "text-primary",
                  )}
                  style={{ paddingInlineStart: getItemOffset(item.depth) }}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

type MobileScrollAnchorTocProps = {
  activeCount: string;
  activeId: HomeSectionId;
  activeItem: LocalizedTocItem;
  anchorLabel: string;
  isExpanded: boolean;
  items: LocalizedTocItem[];
  progress: number;
  onExpand: () => void;
  onSelect: ScrollToSection;
};

function MobileScrollAnchorToc({
  activeCount,
  activeId,
  activeItem,
  anchorLabel,
  isExpanded,
  items,
  progress,
  onExpand,
  onSelect,
}: MobileScrollAnchorTocProps) {
  return (
    <nav
      aria-label={anchorLabel}
      className="fixed inset-x-4 top-3 z-50 lg:hidden"
    >
      <div
        className={cn(
          "relative mx-auto h-8 max-w-[calc(100vw-2rem)] overflow-hidden rounded-full border border-border bg-background/50 shadow-sm backdrop-blur-lg transition-[width,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
          isExpanded ? "w-full bg-background/70 shadow-md" : "w-42",
        )}
      >
        <CollapsedMobileToc
          activeCount={activeCount}
          activeItem={activeItem}
          isExpanded={isExpanded}
          onExpand={onExpand}
        />

        <ExpandedMobileToc
          activeCount={activeCount}
          activeId={activeId}
          activeItem={activeItem}
          isExpanded={isExpanded}
          items={items}
          progress={progress}
          onSelect={onSelect}
        />
      </div>
    </nav>
  );
}

type MobileTocSummaryProps = {
  activeCount: string;
  activeItem: LocalizedTocItem;
};

function MobileTocSummary({ activeCount, activeItem }: MobileTocSummaryProps) {
  return (
    <>
      <span className="relative flex size-5 shrink-0 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-primary/10 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        />
        <span
          aria-hidden="true"
          className="relative size-2 rounded-full bg-primary"
        />
      </span>
      <span className="min-w-0 flex-1 truncate text-left font-medium text-primary">
        {activeItem.label}
      </span>
      <span className=" shrink-0 tabular-nums text-muted-foreground">
        {activeCount}
      </span>
    </>
  );
}

type CollapsedMobileTocProps = MobileTocSummaryProps & {
  isExpanded: boolean;
  onExpand: () => void;
};

function CollapsedMobileToc({
  activeCount,
  activeItem,
  isExpanded,
  onExpand,
}: CollapsedMobileTocProps) {
  return (
    <div
      aria-hidden={isExpanded}
      className={cn(
        "absolute inset-0 flex items-center px-2 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
        isExpanded
          ? "pointer-events-none translate-y-0.5 scale-95 opacity-0"
          : "translate-y-0 scale-100 opacity-100",
      )}
    >
      <button
        type="button"
        aria-label={`${activeItem.label} ${activeCount}`}
        aria-current="location"
        tabIndex={isExpanded ? -1 : undefined}
        onClick={onExpand}
        className="flex h-7 w-full items-center gap-2 text-xs"
      >
        <MobileTocSummary activeCount={activeCount} activeItem={activeItem} />
      </button>
    </div>
  );
}

type ExpandedMobileTocProps = {
  activeCount: string;
  activeId: HomeSectionId;
  activeItem: LocalizedTocItem;
  isExpanded: boolean;
  items: LocalizedTocItem[];
  progress: number;
  onSelect: ScrollToSection;
};

function ExpandedMobileToc({
  activeCount,
  activeId,
  activeItem,
  isExpanded,
  items,
  progress,
  onSelect,
}: ExpandedMobileTocProps) {
  return (
    <div
      aria-hidden={!isExpanded}
      className={cn(
        "absolute inset-0 flex items-center gap-3 px-2 py-1 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
        isExpanded
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none -translate-y-0.5 scale-105 opacity-0",
      )}
    >
      <span className="flex w-18 shrink-0 items-center gap-2 text-xs font-medium text-primary">
        <span className="relative flex size-5 shrink-0 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-primary/10"
          />
          <span
            aria-hidden="true"
            className="relative size-2 rounded-full bg-primary"
          />
        </span>
        <span className="min-w-0 truncate">{activeItem.label}</span>
      </span>

      <div className="relative h-7 min-w-0 flex-1">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        <div
          aria-hidden="true"
          className="absolute inset-y-0 inset-s-0 overflow-hidden transition-[width] duration-200 ease-out"
          style={{ width: `${progress * 100}%` }}
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-primary" />
        </div>

        <div className="relative flex h-full items-center justify-between">
          {items.map((item) => {
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                aria-current={isActive ? "location" : undefined}
                tabIndex={isExpanded ? undefined : -1}
                onClick={() => onSelect(item.id)}
                className="flex h-7 min-w-0 flex-1 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 rounded-full border border-border bg-background transition-[width,height,border-color,background-color,transform] duration-200 ease-out",
                    isActive && "size-2 scale-110 border-primary bg-primary",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <span className=" w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {activeCount}
      </span>
    </div>
  );
}
