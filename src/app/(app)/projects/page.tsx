import { PageHero } from "@/components/site/SiteLayout";
import { Stagger, StaggerItem } from "@/components/site/Reveal";
import { ArrowUpRight, MapPin, Calendar, Clock, CheckSquare, Archive, PlayCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getPublishedProjects } from "@/actions/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore Wujood Welfare's active and completed welfare projects — food drives, medical camps, education initiatives, and more.",
  openGraph: {
    title: "Projects — Wujood Welfare",
    description:
      "Real welfare projects making a real difference across Pakistan.",
  },
  alternates: { canonical: "/projects" },
};

type ProjectStatus = "planned" | "active" | "completed" | "archived";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  planned: {
    label: "Planned",
    className: "bg-blue-500/20 text-blue-200",
    icon: Clock,
  },
  active: {
    label: "Active",
    className: "bg-emerald-500/20 text-emerald-200",
    icon: PlayCircle,
  },
  completed: {
    label: "Completed",
    className: "bg-violet-500/20 text-violet-200",
    icon: CheckSquare,
  },
  archived: {
    label: "Archived",
    className: "bg-white/10 text-white/60",
    icon: Archive,
  },
};

function parseImages(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return raw ? [raw] : [];
  }
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <>
      <PageHero
        eyebrow="Our Projects"
        title="Work in motion."
        subtitle="A look at active and completed welfare projects — real initiatives making real impact."
      />

      <section className="section-y container-x">
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Projects coming soon
            </h2>
            <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
              We&apos;re working on exciting new welfare initiatives. Check back soon!
            </p>
          </div>
        ) : (
          <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => {
              const imgs = parseImages(p.images);
              const coverImg = imgs[0] || "/gallery-food.jpg";
              const statusCfg =
                STATUS_CONFIG[p.status as ProjectStatus] || STATUS_CONFIG.planned;
              const StatusIcon = statusCfg.icon;

              return (
                <StaggerItem key={p.id}>
                  <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card card-lift">
                    <Link href={`/projects/${p.slug}`} className="block">
                      {/* Image */}
                      <div className="relative aspect-4/3 overflow-hidden">
                        <Image
                          src={coverImg}
                          alt={p.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 95vw"
                          className="image-hover-zoom object-cover"
                        />

                        {/* Status badge */}
                        <span
                          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm ${statusCfg.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </span>

                        {/* Image count indicator */}
                        {imgs.length > 1 && (
                          <span className="absolute top-3 right-3 rounded-full bg-black/50 text-white px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
                            +{imgs.length - 1} photos
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Program tag */}
                        {p.program && (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                            {p.program.title}
                          </span>
                        )}

                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {p.title}
                        </h3>

                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                          {p.description}
                        </p>

                        {/* Meta row */}
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                          {p.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              {p.location}
                            </span>
                          )}
                          {(p.startDate || p.endDate) && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              {p.startDate
                                ? formatDate(p.startDate)
                                : ""}
                              {p.startDate && p.endDate ? " – " : ""}
                              {p.endDate ? formatDate(p.endDate) : ""}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                            View Details <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </section>
    </>
  );
}
