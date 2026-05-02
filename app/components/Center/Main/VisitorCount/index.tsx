import { IconMapPin } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/site/config";

export default function VisitorCount() {
  const label = siteConfig.profileLocations?.trim();
  if (!label) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className="max-w-[min(100%,14rem)] gap-0.5 px-1.5 py-0 text-[0.6rem] leading-tight sm:text-[0.7rem] md:gap-1 md:px-2 md:text-xs [&>svg]:size-2.5 md:[&>svg]:size-3"
    >
      <IconMapPin className="shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
    </Badge>
  );
}
