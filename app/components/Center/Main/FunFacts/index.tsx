import SectionHeader from "@/components/Center/SectionHeader";
import { useSiteContent } from "@/hooks/useSiteContent";

const FUN_FACT_LINKS: Array<{ label: string; href: string }> = [
  {
    label: "Cities: Skylines",
    href: "https://store.steampowered.com/app/255710/Cities_Skylines/",
  },
  { label: "Golden State Warriors", href: "https://www.nba.com/warriors" },
  { label: "Chelsea FC", href: "https://www.chelseafc.com/en" },
];

function renderFunFactText(text: string) {
  const labels = FUN_FACT_LINKS.map((x) => x.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${labels.join("|")})`, "g");
  const parts = text.split(re);

  return parts.map((part, idx) => {
    const hit = FUN_FACT_LINKS.find((x) => x.label === part);
    if (!hit) return <span key={`${idx}-${part}`}>{part}</span>;

    return (
      <a
        key={`${idx}-${hit.label}`}
        href={hit.href}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
      >
        {hit.label}
      </a>
    );
  });
}

export default function FunFacts() {
  const {
    home: { funFacts },
  } = useSiteContent();

  return (
    <>
      <SectionHeader>{funFacts.title}</SectionHeader>
      <div className="px-4 pt-4 pb-5 sm:pt-5 sm:pb-6">
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex snap-x snap-mandatory gap-3 md:gap-4">
            {funFacts.items.map((text, idx) => (
              <div
                key={`${idx}-${text}`}
                className="w-full shrink-0 snap-start md:w-[calc(50%-0.5rem)]"
              >
                <div className="group h-full rounded-xl border border-border/60 bg-muted/20 p-4 transition-all hover:-translate-y-0.5 hover:bg-muted/30">
                  <p className="text-sm leading-7 text-muted-foreground">
                    {renderFunFactText(text)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

