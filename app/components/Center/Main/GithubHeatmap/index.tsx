import { ActivityCalendar } from "react-activity-calendar";
import { useCallback, useMemo, type ReactElement, type SVGProps } from "react";
import SectionHeader from "@/components/Center/SectionHeader";
import { formatContentTemplate } from "@/content";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLanguage } from "@/provider/language-provider";
import { useTheme } from "@/provider/theme-provider";

const getDateSeed = (date: string) =>
  date.split("").reduce((seed, char) => seed + char.charCodeAt(0), 0);

const getContributionCount = (date: string) => {
  const seed = getDateSeed(date);
  return (seed * 17 + seed ** 2) % 10;
};

type CalendarData = {
  data: Array<{
    date: string;
    count: number;
    level: number;
  }>;
  tooltipByDate: Map<string, string>;
};

function generateData(
  year: number,
  locale: string,
  formatTooltip: (date: string, count: number) => string,
): CalendarData {
  const data = [];
  const tooltipByDate = new Map<string, string>();
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
  });
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));

  for (
    let date = new Date(start);
    date <= end;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const currentDate = date.toISOString().slice(0, 10);
    const count = getContributionCount(currentDate);
    const formattedDate = dateFormatter.format(date);

    data.push({
      date: currentDate,
      count,
      level: Math.min(4, Math.floor(count / 2)),
    });
    tooltipByDate.set(currentDate, formatTooltip(formattedDate, count));
  }

  return { data, tooltipByDate };
}

export default function Calendar() {
  const {
    home: { github },
  } = useSiteContent();
  const { locale } = useLanguage();
  const { theme } = useTheme();
  const currentYear = new Date().getUTCFullYear();
  const calendarLocale = locale;

  const { data, tooltipByDate } = useMemo(
    () =>
      generateData(currentYear, calendarLocale, (date, count) =>
        formatContentTemplate(github.activityTemplate, {
          date,
          count,
        }),
      ),
    [calendarLocale, currentYear, github.activityTemplate],
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
        <div className="-mx-2 overflow-x-auto px-2">
          <div className="flex justify-center">
            <ActivityCalendar
              data={data}
              blockMargin={2}
              blockSize={12}
              renderBlock={renderBlock}
              labels={labels}
              colorScheme={theme}
            />
          </div>
        </div>
      </div>
    </>
  );
}
