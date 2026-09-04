import { Badge } from "@/components/ui/badge";
import {
  IconBriefcase,
  IconSchool,
  IconCode,
  IconStar,
  IconRocket,
  IconBolt,
  IconCoffee,
  IconMoon,
} from "@tabler/icons-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { BadgeIconKey } from "@/types";

const badgeIconMap: Record<BadgeIconKey, typeof IconBriefcase> = {
  briefcase: IconBriefcase,
  school: IconSchool,
  code: IconCode,
  star: IconStar,
  rocket: IconRocket,
  bolt: IconBolt,
  coffee: IconCoffee,
  moon: IconMoon,
};

export default function BadgeBar() {
  const {
    home: {
      about: { badges },
    },
  } = useSiteContent();

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => {
        const Icon = badgeIconMap[badge.icon];

        return (
          <Badge
            key={badge.id}
            variant="secondary"
            className="h-5 gap-1 px-2 py-0 text-xs border-border/60 bg-secondary/80 [&>svg]:size-3"
          >
            <Icon aria-hidden="true" />
            {badge.label}
          </Badge>
        );
      })}
    </div>
  );
}
