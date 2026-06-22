import Experiences from "@/components/Center/Main/Experiences";
import GithubHeatmap from "@/components/Center/Main/GithubHeatmap";
import Introduce from "@/components/Center/Main/Introduce";
import Introduction from "@/components/Center/Main/Introduction";
import Publications from "@/components/Center/Main/Publications";
import Newsletter from "@/components/Center/Main/Newsletter";
import Projects from "@/components/Center/Main/Projects";
import StudyNotes from "@/components/Center/Main/StudyNotes";
import Blogs from "@/components/Center/Main/Blogs";
import Resume from "@/components/Center/Main/Resume";
import SkillsTechnologies from "@/components/Center/Main/SkillsTechnologies";
import Socials from "@/components/Center/Main/Socials";
import UserCard from "@/components/Center/Main/UserCard";
import SectionFrame from "@/components/Center/SectionFrame";
import { ScrollAnchorToc } from "@/components/ScrollAnchorToc";
import { useSiteContent } from "@/hooks/useSiteContent";
import FunFacts from "@/components/Center/Main/FunFacts";
import Gallery from "@/components/Center/Main/Gallery";

export default function Home() {
  const { home } = useSiteContent();

  return (
    <>
      <ScrollAnchorToc />

      <SectionFrame id="profile" tocLabel={home.profile.tocLabel} tocDepth={2}>
        <UserCard />
      </SectionFrame>

      <SectionFrame id="about" tocLabel={home.about.tocLabel} tocDepth={2}>
        <Introduce />
      </SectionFrame>

      <SectionFrame id="socials" tocLabel={home.socials.tocLabel} tocDepth={3}>
        <Socials />
      </SectionFrame>

      <SectionFrame
        id="publications"
        tocLabel={home.publications.tocLabel}
        tocDepth={3}
      >
        <Publications />
      </SectionFrame>

      <SectionFrame
        id="projects"
        tocLabel={home.projects.tocLabel}
        tocDepth={2}
      >
        <Projects />
      </SectionFrame>

      <SectionFrame id="github" tocLabel={home.github.tocLabel} tocDepth={3}>
        <GithubHeatmap />
      </SectionFrame>

      <SectionFrame
        id="experiences"
        tocLabel={home.experiences.tocLabel}
        tocDepth={3}
      >
        <Experiences />
      </SectionFrame>

      <SectionFrame
        id="skills"
        tocLabel={home.skills.tocLabel}
        tocDepth={3}
      >
        <SkillsTechnologies />
      </SectionFrame>

      <SectionFrame
        id="study-notes"
        tocLabel={home.studyNotes.tocLabel}
        tocDepth={2}
      >
        <StudyNotes />
      </SectionFrame>

      <SectionFrame
        id="blogs"
        tocLabel={home.blogs.tocLabel}
        tocDepth={2}
      >
        <Blogs />
      </SectionFrame>

      <SectionFrame id="resume" tocLabel={home.resume.tocLabel} tocDepth={2}>
        <Resume />
      </SectionFrame>

      <SectionFrame id="gallery" tocLabel={home.gallery.tocLabel} tocDepth={2}>
        <Gallery />
      </SectionFrame>

      <SectionFrame
        id="fun-facts"
        tocLabel={home.funFacts.tocLabel}
        tocDepth={2}
      >
        <FunFacts />
      </SectionFrame>

      <SectionFrame
        id="newsletter"
        tocLabel={home.newsletter.tocLabel}
        tocDepth={3}
      >
        <Newsletter />
      </SectionFrame>

      <SectionFrame
        id="introduction"
        tocLabel={home.introduction.tocLabel}
        tocDepth={2}
      >
        <Introduction />
      </SectionFrame>
    </>
  );
}
