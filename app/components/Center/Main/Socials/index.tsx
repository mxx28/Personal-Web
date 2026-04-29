import SectionHeader from "@/components/Center/SectionHeader";
import AccountSection from "@/components/Center/Main/AccountSection";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function Socials() {
  const {
    home: { socials },
  } = useSiteContent();

  return (
    <>
      <SectionHeader>{socials.title}</SectionHeader>
      <div className="px-4 py-3">
        <AccountSection />
      </div>
    </>
  );
}

