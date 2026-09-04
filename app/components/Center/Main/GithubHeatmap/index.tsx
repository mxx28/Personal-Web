import { ActivityCalendar } from "react-activity-calendar";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type SVGProps,
} from "react";
import SectionHeader from "@/components/Center/SectionHeader";
import { formatContentTemplate } from "@/content";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLanguage } from "@/provider/language-provider";
import { useTheme } from "@/provider/theme-provider";
import { siteConfig } from "@/site/config";

type CalendarEntry = { date: string; count: number; level: number };

type ContributionsResponse = {
  contributions: CalendarEntry[];
};

function buildTooltips(
  entries: CalendarEntry[],
  locale: string,
  formatTooltip: (date: string, count: number) => string,
): Map<string, string> {
  const dateFormatter = new Intl.DateTimeFormat(locale, { timeZone: "UTC" });
  const tooltipByDate = new Map<string, string>();

  for (const entry of entries) {
    const formattedDate = dateFormatter.format(new Date(`${entry.date}T00:00:00Z`));
    tooltipByDate.set(entry.date, formatTooltip(formattedDate, entry.count));
  }

  return tooltipByDate;
}

async function fetchContributions(
  username: string,
  signal: AbortSignal,
): Promise<CalendarEntry[]> {
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
    { signal },
  );

  if (!res.ok) {
    throw new Error(`GitHub contributions request failed (${res.status})`);
  }

  const json: ContributionsResponse = await res.json();
  return json.contributions;
}

// Blocks scale to fill the available width so the calendar never leaves
// empty margins on wide screens, keeping this ratio between block size and
// the gap between blocks.
const blockMarginRatio = 0.18;
const minBlockSize = 8;
const maxBlockSize = 20;

function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

function useMinWidthMedia(px: number) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(min-width:${px}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(min-width:${px}px)`);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [px]);

  return matches;
}

export default function Calendar() {
  const {
    home: { github },
  } = useSiteContent();
  const { locale } = useLanguage();
  const { theme } = useTheme();
  const currentYear = new Date().getUTCFullYear();
  const calendarLocale = locale;
  const wideLayout = useMinWidthMedia(1024);

  const [entries, setEntries] = useState<CalendarEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [containerRef, containerWidth] = useContainerWidth<HTMLDivElement>();

  useEffect(() => {
    const controller = new AbortController();
    setEntries(null);
    setError(false);

    fetchContributions(siteConfig.github.username, controller.signal)
      .then(setEntries)
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(true);
      });

    return () => controller.abort();
  }, []);

  const tooltipByDate = useMemo(
    () =>
      entries
        ? buildTooltips(entries, calendarLocale, (date, count) =>
            formatContentTemplate(github.activityTemplate, { date, count }),
          )
        : new Map<string, string>(),
    [entries, calendarLocale, github.activityTemplate],
  );
  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, monthIndex) =>
        new Date(Date.UTC(currentYear, monthIndex, 1)).toLocaleString(
          calendarLocale,
          {
            month: "short",
            timeZone: "UTC",
          },
        ),
      ),
    [calendarLocale, currentYear],
  );
  const labels = useMemo(
    () => ({
      totalCount: formatContentTemplate(github.totalTemplate, {
        count: "{{count}}",
        year: "{{year}}",
      }),
      legend: {
        less: github.legend.less,
        more: github.legend.more,
      },
      weekdays: github.weekdays,
      months: monthLabels,
    }),
    [github, monthLabels],
  );
  const weekCount = Math.ceil((entries?.length ?? 371) / 7);
  const blockSize =
    containerWidth > 0
      ? Math.min(
          maxBlockSize,
          Math.max(
            minBlockSize,
            containerWidth / (weekCount * (1 + blockMarginRatio) - blockMarginRatio),
          ),
        )
      : wideLayout
        ? 14
        : 12;
  const blockMargin = blockSize * blockMarginRatio;

  const renderBlock = useCallback(
    (
      block: ReactElement<SVGProps<SVGRectElement>>,
      activity: { date: string },
    ) => {
      const tooltipText = tooltipByDate.get(activity.date);

      return (
        <g aria-label={tooltipText}>
          {tooltipText ? <title>{tooltipText}</title> : null}
          {block}
        </g>
      );
    },
    [tooltipByDate],
  );

  return (
    <>
      <SectionHeader>{github.title}</SectionHeader>
      <div className="px-2 py-2 sm:px-4">
        {error ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            {github.errorMessage}
          </p>
        ) : (
          <div ref={containerRef} className="-mx-2 overflow-x-auto px-2">
            <div className="flex justify-center">
              <ActivityCalendar
                data={entries ?? []}
                loading={entries === null}
                blockMargin={blockMargin}
                blockSize={blockSize}
                fontSize={wideLayout ? 13 : 12}
                renderBlock={renderBlock}
                labels={labels}
                colorScheme={theme}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
