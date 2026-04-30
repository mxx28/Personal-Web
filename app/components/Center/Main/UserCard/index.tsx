import { ModeToggle } from "@/components/ModeToggle";
import VisitorCount from "@/components/Center/Main/VisitorCount";
import { RoleCycle } from "@/components/Center/Main/RoleCycle";
import { useSiteContent } from "@/hooks/useSiteContent";
import { siteConfig } from "@/site/config";

export default function UserCard() {
  const {
    home: { profile },
  } = useSiteContent();

  return (
    <div className="flex w-full items-center justify-between p-2 md:px-6 md:py-3">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-4 sm:gap-4">
        {/* Avatar */}
        <div className="size-18 shrink-0 rounded-2xl bg-background p-0.5 ring-1 ring-black/20 sm:size-24 dark:ring-white/25">
          <div className="h-full w-full overflow-hidden rounded-[calc(theme(borderRadius.2xl)-2px)]">
            <img
              src={siteConfig.avatarSrc}
              alt={profile.avatarAlt}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-col justify-center gap-2 h-full">
          <h1 className="truncate text-lg font-semibold leading-tight sm:text-2xl">
            {profile.name}
          </h1>

          <div className="text-sm text-muted-foreground sm:text-base">
            <RoleCycle roles={profile.roles} />
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col shrink-0 items-end justify-between gap-3 sm:gap-4">
        <ModeToggle />
        <VisitorCount />
      </div>
    </div>
  );
}
