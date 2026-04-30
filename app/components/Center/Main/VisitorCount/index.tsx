import { IconMapPin } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/site/config";

export default function VisitorCount() {
  const label = siteConfig.profileLocations?.trim();
  if (!label) {
    return null;
  }

  return (
    <Badge variant="secondary" className="max-w-[min(100%,14rem)]">
      <IconMapPin />
      <span className="truncate">{label}</span>
    </Badge>
  );
}
