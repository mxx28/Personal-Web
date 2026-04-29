import Header from "@/components/Center/ProjectDetail/Header";
import Image from "@/components/Center/ProjectDetail/Image";
import Main from "@/components/Center/ProjectDetail/Main";
import ThreeTabs from "@/components/Center/ProjectDetail/ThreeTabs";
import SectionFrame from "@/components/Center/SectionFrame";
import { NotFound } from "@/components/Center/ProjectDetail/NotFound";
import { useProject } from "@/hooks/useProjects";
import { Tabs } from "@/components/ui/tabs";
import { ScrollRestoration, useParams } from "react-router";

export default function ProjectDetailRoute() {
  const { slug = "" } = useParams();
  const project = useProject(slug);

  return (
    <>
      <ScrollRestoration />
      <SectionFrame>
        <Header slug={slug} />
      </SectionFrame>
      {project ? (
        <>
          <SectionFrame>
            <Image slug={slug} project={project} />
          </SectionFrame>
          <Tabs defaultValue="overview" className="contents">
            <SectionFrame>
              <ThreeTabs slug={slug} />
            </SectionFrame>
            <SectionFrame>
              <Main project={project} />
            </SectionFrame>
          </Tabs>
        </>
      ) : (
        <SectionFrame>
          <NotFound />
        </SectionFrame>
      )}
    </>
  );
}
