import BadgeBar from "@/components/Center/Main/BadgeBar";
import Reserve from "@/components/Center/Main/Reserve";
import { useSiteContent } from "@/hooks/useSiteContent";
import { siteConfig } from "@/site/config";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type TextPart = { text: string; href?: string };

function normalizeIntroParagraphs(
  greetingParagraphs: TextPart[][] | null,
  greetingInlineParts: TextPart[] | null,
  greetingText: string | null,
  statusParagraphs: TextPart[][] | null,
  statusParts: TextPart[] | null,
  statusText: string | null,
): TextPart[][] {
  const blocks: TextPart[][] = [];

  if (greetingParagraphs?.length) {
    blocks.push(...greetingParagraphs);
  } else if (greetingInlineParts?.length) {
    blocks.push(greetingInlineParts);
  } else if (greetingText?.trim()) {
    blocks.push([{ text: greetingText }]);
  }

  if (statusParagraphs?.length) {
    blocks.push(...statusParagraphs);
  } else if (statusParts?.length) {
    blocks.push(statusParts);
  } else if (statusText?.trim()) {
    blocks.push([{ text: statusText }]);
  }

  return blocks;
}

function totalChars(paragraphs: TextPart[][]) {
  return paragraphs.reduce(
    (sum, para) => sum + para.reduce((s, p) => s + p.text.length, 0),
    0,
  );
}

const CHAR_MS = 19;

function renderPart(
  part: TextPart,
  sliceLen: number,
  key: string,
): ReactNode {
  const slice = part.text.slice(0, sliceLen);
  if (part.href) {
    return (
      <a
        key={key}
        href={part.href}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-4 hover:text-foreground"
      >
        {slice}
      </a>
    );
  }
  return <span key={key}>{slice}</span>;
}

function Cursor() {
  return (
    <span
      className="ml-px inline-block h-[1em] w-0.5 translate-y-px animate-pulse bg-foreground/45 align-middle"
      aria-hidden
    />
  );
}

function TypingIntroContent({ paragraphs }: { paragraphs: TextPart[][] }) {
  const total = useMemo(() => totalChars(paragraphs), [paragraphs]);
  const contentKey = useMemo(() => JSON.stringify(paragraphs), [paragraphs]);
  const flatParts = useMemo(
    () =>
      paragraphs.flatMap((para, pIdx) =>
        para.map((part, i) => ({ pIdx, i, part })),
      ),
    [paragraphs],
  );
  const [typed, setTyped] = useState(0);
  const [done, setDone] = useState(false);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (total === 0) {
      setTyped(0);
      setDone(true);
      return;
    }

    if (reduceMotionRef.current) {
      setTyped(total);
      setDone(true);
      return;
    }

    setTyped(0);
    setDone(false);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      if (n >= total) {
        window.clearInterval(id);
        setTyped(total);
        setDone(true);
        return;
      }
      setTyped(n);
    }, CHAR_MS);

    return () => window.clearInterval(id);
  }, [contentKey, total]);

  const rendered = useMemo(() => {
    let k = 0;
    const out: ReactNode[] = [];
    let children: ReactNode[] = [];
    let activePIdx = -1;

    const flush = (pKey: number) => {
      if (children.length === 0) return;
      out.push(
        <p key={pKey} className="text-sm leading-7 text-foreground/90">
          {children}
        </p>,
      );
      children = [];
    };

    for (const { pIdx, i, part } of flatParts) {
      if (pIdx !== activePIdx) {
        if (activePIdx !== -1) {
          flush(activePIdx);
        }
        activePIdx = pIdx;
      }

      const L = part.text.length;
      const end = k + L;

      if (typed >= end) {
        children.push(renderPart(part, L, `${pIdx}-${i}-full`));
        k = end;
      } else if (typed > k) {
        const sliceLen = typed - k;
        children.push(renderPart(part, sliceLen, `${pIdx}-${i}-part`));
        if (!done) children.push(<Cursor key={`${pIdx}-${i}-c`} />);
        k = typed;
        flush(pIdx);
        return out;
      } else if (typed === k) {
        if (!done && children.length > 0) {
          children.push(<Cursor key={`${pIdx}-${i}-wait`} />);
        }
        flush(pIdx);
        return out;
      } else {
        flush(pIdx);
        return out;
      }
    }

    if (activePIdx !== -1) {
      flush(activePIdx);
    }

    return out;
  }, [flatParts, typed, done]);

  return <div className="flex flex-col gap-1.5">{rendered}</div>;
}

export default function Introduce() {
  const {
    home: { about },
  } = useSiteContent();
  const hasContactActions = Boolean(siteConfig.contact.bookingUrl?.trim());

  const greetingParts = Array.isArray(about.greeting) ? about.greeting : null;
  const greetingText = typeof about.greeting === "string" ? about.greeting : null;
  const greetingParagraphs = Array.isArray(greetingParts?.[0])
    ? (about.greeting as Array<Array<{ text: string; href?: string }>>)
    : null;
  const greetingInlineParts = greetingParagraphs
    ? null
    : (greetingParts as Array<{ text: string; href?: string }> | null);
  const statusText = typeof about.status === "string" ? about.status : null;
  const statusArray = Array.isArray(about.status) ? about.status : null;
  const statusParagraphs = Array.isArray(statusArray?.[0])
    ? (about.status as Array<Array<{ text: string; href?: string }>>)
    : null;
  const statusParts = statusParagraphs
    ? null
    : (statusArray as Array<{ text: string; href?: string }> | null);

  const paragraphs = useMemo(
    () =>
      normalizeIntroParagraphs(
        greetingParagraphs,
        greetingInlineParts,
        greetingText,
        statusParagraphs,
        statusParts,
        statusText,
      ),
    [
      greetingParagraphs,
      greetingInlineParts,
      greetingText,
      statusParagraphs,
      statusParts,
      statusText,
    ],
  );

  return (
    <div className="flex flex-col items-start gap-2 p-4">
      {paragraphs.length > 0 ? (
        <TypingIntroContent paragraphs={paragraphs} />
      ) : null}
      {hasContactActions ? (
        <div className="mt-1 flex flex-wrap gap-2.5">
          <Reserve />
        </div>
      ) : null}
      <div className="mt-2">
        <BadgeBar />
      </div>
    </div>
  );
}
