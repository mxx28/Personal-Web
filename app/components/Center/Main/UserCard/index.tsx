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
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <div className="size-20 shrink-0 rounded-2xl bg-background p-0.5 ring-1 ring-black/20 sm:size-28 dark:ring-white/25">
          <div className="h-full w-full overflow-hidden rounded-[calc(theme(borderRadius.2xl)-2px)]">
            <img
              src={siteConfig.avatarSrc}
              alt={profile.avatarAlt}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <h1 className="break-words text-lg font-semibold leading-tight sm:text-2xl">
            {profile.name}
          </h1>

          <div className="text-sm text-muted-foreground sm:text-base">
            <RoleCycle roles={profile.roles} />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-3 sm:gap-4">
        <ModeToggle />
        <VisitorCount />
      </div>
    </div>
  );
}
