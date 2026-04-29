import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import SectionHeader from "@/components/Center/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { useLayoutEffect } from "react";
import { Link, useLocation, useViewTransitionState } from "react-router";
import { TransitionImage } from "@/components/TransitionImage";

function BlogCard({
  href,
  blogId,
  cover,
  title,
  badge,
  summary,
  viewDetailsLabel,
}: {
  href: string;
  blogId: string;
  cover: string;
  title: string;
  badge?: string;
  summary: string;
  viewDetailsLabel: string;
}) {
  const isBlogTransitioning = useViewTransitionState(href);
  const transitionName = isBlogTransitioning ? `blog-cover-${blogId}` : "none";

  return (
    <Link
      to={href}
      viewTransition
      state={{ viewTransitionBlogId: blogId, cover }}
      data-blog-id={blogId}
      className="group flex w-full flex-col p-4 text-left transition-colors hover:bg-muted/30 sm:p-6"
    >
      <div className="flex flex-col gap-4 transition-all duration-300 group-hover:-translate-y-1">
        <TransitionImage transitionName={transitionName} src={cover} alt={`${title} cover`} />

        <div className="flex flex-col gap-2.5 px-2.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 flex-1 truncate text-xl font-semibold leading-tight text-foreground">
              {title}
            </h3>

            {badge ? (
              <Badge variant="outline" className="shrink-0 bg-muted text-foreground">
                <span className="relative size-1.5 rounded-full bg-current before:absolute before:inset-0 before:animate-ping before:rounded-full before:bg-current" />
                <span>{badge}</span>
              </Badge>
            ) : null}
          </div>

          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {summary}
          </p>

          <span className="flex items-center gap-1 pt-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            {viewDetailsLabel}
            <IconArrowNarrowRight data-icon="inline-end" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Blogs() {
  const {
    home: { blogs },
  } = useSiteContent();
  const location = useLocation();
  const returnBlogId = (location.state as { viewTransitionBlogId?: string } | null)
    ?.viewTransitionBlogId;

  useLayoutEffect(() => {
    if (!returnBlogId) return;
    document
      .querySelector(`[data-blog-id="${returnBlogId}"]`)
      ?.scrollIntoView({ block: "center", inline: "center" });
  }, [returnBlogId]);

  return (
    <>
      <SectionHeader>{blogs.title}</SectionHeader>
      <div className="px-4 pb-2">
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex snap-x snap-mandatory gap-4 md:gap-4">
            {blogs.items.map((blog) => (
              <div
                key={blog.id}
                className="flex-shrink-0 snap-start w-full md:w-[calc(50%-0.5rem)]"
              >
                <BlogCard
                  href={`/blog/${blog.id}`}
                  blogId={blog.id}
                  cover={blog.cover}
                  title={blog.title}
                  badge={blog.badge}
                  summary={blog.summary}
                  viewDetailsLabel={blogs.viewDetailsLabel}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

