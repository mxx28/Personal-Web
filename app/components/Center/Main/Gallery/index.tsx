import SectionHeader from "@/components/Center/SectionHeader";
import { useSiteContent } from "@/hooks/useSiteContent";

function toTitleCase(input: string) {
  return input
    .split(/[-_ ]+/g)
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(" ");
}

function getCaptionFromSrc(src: string) {
  const file = src.split("/").pop() ?? src;
  const name = file.replace(/\.[a-z0-9]+$/i, "");
  return toTitleCase(name);
}

export default function Gallery() {
  const {
    home: { gallery },
  } = useSiteContent();

  return (
    <>
      <SectionHeader>{gallery.title}</SectionHeader>
      <div className="px-4 py-2">
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex snap-x snap-mandatory gap-3 md:gap-4">
            {gallery.items.map((img, idx) => (
              <div
                key={`${idx}-${img.src}`}
                className="shrink-0 snap-start"
              >
                <div style={{ height: "11.5rem" }}>
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-auto max-w-none rounded-xl border border-border/60 object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {getCaptionFromSrc(img.src)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

