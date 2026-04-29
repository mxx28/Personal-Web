import { Button } from "@/components/ui/button";
import { IconMail } from "@tabler/icons-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { siteConfig } from "@/site/config";

export default function SendEmail() {
  const { ui } = useSiteContent();
  const email = siteConfig.resume.email.trim();

  if (!email) {
    return null;
  }

  const handleClick = async () => {
    try {
      await navigator.clipboard?.writeText?.(email);
    } catch {
      // best-effort clipboard; mailto still works even if this fails
    }
  };

  return (
    <Button size="sm" variant="outline" className="" asChild>
      <a
        href={`mailto:${encodeURIComponent(email)}`}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
      >
        <IconMail data-icon="inline-start" />
        <span className="hidden sm:inline">
          Email me: <span className="font-mono">{email}</span>
        </span>
        <span className="sm:hidden">{ui.actions.sendEmail}</span>
      </a>
    </Button>
  );
}
