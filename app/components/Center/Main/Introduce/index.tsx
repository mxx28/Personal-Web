import BadgeBar from "@/components/Center/Main/BadgeBar";
import Reserve from "@/components/Center/Main/Reserve";
import { useSiteContent } from "@/hooks/useSiteContent";
import { siteConfig } from "@/site/config";

export default function Introduce() {
  const {
    home: { about },
  } = useSiteContent();
  const hasContactActions = Boolean(siteConfig.contact.bookingUrl?.trim());

  const greetingParts = Array.isArray(about.greeting) ? about.greeting : null;
  const greetingText = typeof about.greeting === "string" ? about.greeting : null;
  const statusText = typeof about.status === "string" ? about.status : null;
  const statusArray = Array.isArray(about.status) ? about.status : null;
  const statusParagraphs = Array.isArray(statusArray?.[0])
    ? (statusArray as Array<Array<{ text: string; href?: string }>>)
    : null;
  const statusParts = statusParagraphs
    ? null
    : (statusArray as Array<{ text: string; href?: string }> | null);

  return (
    <div className="flex flex-col items-start gap-2 p-4">
      <p className="text-sm leading-7 text-foreground/90">
        {greetingParts
          ? greetingParts.map((part, idx) =>
              part.href ? (
                <a
                  key={`${part.href}-${idx}`}
                  href={part.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {part.text}
                </a>
              ) : (
                <span key={`${part.text}-${idx}`}>{part.text}</span>
              ),
            )
          : greetingText}
      </p>

      {statusParagraphs ? (
        <div className="flex flex-col gap-1.5">
          {statusParagraphs.map((paragraph, pIdx) => (
            <p key={pIdx} className="text-sm leading-7 text-foreground/90">
              {paragraph.map((part, idx) =>
                part.href ? (
                  <a
                    key={`${part.href}-${idx}`}
                    href={part.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    {part.text}
                  </a>
                ) : (
                  <span key={`${part.text}-${idx}`}>{part.text}</span>
                ),
              )}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-7 text-foreground/90">
          {statusParts
            ? statusParts.map((part, idx) =>
                part.href ? (
                  <a
                    key={`${part.href}-${idx}`}
                    href={part.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    {part.text}
                  </a>
                ) : (
                  <span key={`${part.text}-${idx}`}>{part.text}</span>
                ),
              )
            : statusText}
        </p>
      )}
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
