import SectionHeader from "@/components/Center/SectionHeader";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function FunFacts() {
  const {
    home: { funFacts },
  } = useSiteContent();

  return (
    <>
      <SectionHeader>{funFacts.title}</SectionHeader>
      <div className="px-4 pb-2">
        <ul className="flex flex-col gap-2 text-sm leading-7 text-muted-foreground md:pl-1">
          {funFacts.items.map((text, idx) => (
            <li key={`${idx}-${text}`}>{text}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

