import { useSiteContent } from "@/hooks/useSiteContent";
import { ExperienceList } from "@/components/Center/Main/Experiences";

export default function ResearchExperiences() {
  const {
    home: { researchExperiences },
  } = useSiteContent();

  if (researchExperiences.items.length === 0) {
    return (
      <div className="px-4 pb-2 text-sm leading-7 text-muted-foreground">
        Add your research experiences here.
      </div>
    );
  }

  return (
    <ExperienceList
      title={researchExperiences.title}
      items={researchExperiences.items}
    />
  );
}

