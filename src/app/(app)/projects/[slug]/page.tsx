import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckSquare,
  Archive,
  PlayCircle,
  Layers,
  ExternalLink,
} from "lucide-react";
import { getPublishedProjectBySlug, getPublishedProjects } from "@/actions/projects";
import { PageHero } from "@/components/site/SiteLayout";

type ProjectStatus = "planned" | "active" | "completed" | "archived";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string; dotClass: string; icon: React.ElementType }
> = {
  planned: {
    label: "Planned",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-400/30",
    dotClass: "bg-blue-500",
    icon: Clock,
  },
  active: {
    label: "Currently Active",
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-400/30",
    dotClass: "bg-emerald-500 animate-pulse",
    icon: PlayCircle,
  },
  completed: {
    label: "Completed",
    className:
      "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-400/30",
    dotClass: "bg-violet-500",
    icon: CheckSquare,
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
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
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  const imgs = parseImages(project.images);
  const coverImg = imgs[0];

  return {
    title: project.title,
    description: project.description.slice(0, 160),
    openGraph: {
      title: `${project.title} — Wujood Welfare`,
      description: project.description.slice(0, 160),
      ...(coverImg ? { images: [{ url: coverImg, alt: project.title }] } : {}),
    },
    alternates: { canonical: `/projects/${slug}` },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) notFound();

  const imgs = parseImages(project.images);
  const coverImg = imgs[0] || "/gallery-food.jpg";
  const galleryImgs = imgs.slice(1);
  const statusCfg = STATUS_CONFIG[project.status as ProjectStatus] || STATUS_CONFIG.planned;
  const StatusIcon = statusCfg.icon;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        {/* Cover image overlay */}
        <div className="absolute inset-0">
          <Image
            src={coverImg}
            alt={project.title}
            fill
            priority
            className="object-cover opacity-20"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/90" />
        </div>

        <div className="container-x relative py-20 md:py-28">
          {/* Back */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            All Projects
          </Link>

          {/* Status + Program tag row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest backdrop-blur-sm ${statusCfg.className}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </span>

            {project.program && (
              <Link
                href="/programs"
                className="inline-flex items-center gap-1 rounded-full bg-secondary/20 border border-secondary/30 px-3 py-1 text-xs font-semibold text-secondary hover:bg-secondary/30 transition-colors"
              >
                <Layers className="h-3 w-3" />
                {project.program.title}
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </Link>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl">
            {project.title}
          </h1>

          {/* Meta row */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-foreground/70">
            {project.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />
                {project.location}
              </span>
            )}
            {project.startDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0" />
                {formatDate(project.startDate)}
                {project.endDate ? ` → ${formatDate(project.endDate)}` : ""}
              </span>
            )}
            {!project.startDate && project.endDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0" />
                Until {formatDate(project.endDate)}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <article className="section-y container-x">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover image (large) */}
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border shadow-md">
              <Image
                src={coverImg}
                alt={project.title}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 66vw, 95vw"
              />
            </div>

            {/* Description */}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Project</h2>
              {project.description.split("\n").map((para, i) =>
                para.trim() ? (
                  <p key={i} className="text-base text-muted-foreground leading-relaxed mb-4">
                    {para}
                  </p>
                ) : null
              )}
            </div>

            {/* Photo gallery */}
            {galleryImgs.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Project Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImgs.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square overflow-hidden rounded-xl border border-border group"
                    >
                      <Image
                        src={img}
                        alt={`${project.title} – photo ${idx + 2}`}
                        fill
                        className="image-hover-zoom object-cover"
                        sizes="(min-width: 640px) 20vw, 45vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick info card */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Project Details
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusCfg.className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                      {statusCfg.label}
                    </span>
                  </dd>
                </div>

                {project.location && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground shrink-0">Location</dt>
                    <dd className="text-right font-medium text-foreground text-xs">
                      {project.location}
                    </dd>
                  </div>
                )}

                {project.startDate && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground shrink-0">Start</dt>
                    <dd className="text-right font-medium text-foreground text-xs">
                      {formatDate(project.startDate)}
                    </dd>
                  </div>
                )}

                {project.endDate && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground shrink-0">End</dt>
                    <dd className="text-right font-medium text-foreground text-xs">
                      {formatDate(project.endDate)}
                    </dd>
                  </div>
                )}

                {project.program && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground shrink-0">Program</dt>
                    <dd className="text-right font-medium text-foreground text-xs">
                      {project.program.title}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* CTA */}
            <div className="rounded-2xl gradient-gold p-6 text-center space-y-3">
              <h3 className="text-lg font-bold text-foreground">
                Support This Project
              </h3>
              <p className="text-sm text-foreground/70">
                Your contribution helps us continue this vital welfare work.
              </p>
              <Link
                href="/donate"
                className="block w-full bg-foreground text-background font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Donate Now
              </Link>
              <Link
                href="/volunteer"
                className="block w-full border border-foreground/20 text-foreground font-semibold text-sm py-2.5 rounded-xl hover:bg-foreground/5 transition-colors"
              >
                Volunteer With Us
              </Link>
            </div>

            {/* Back to projects */}
            <Link
              href="/projects"
              className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl py-3 transition-colors hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4" />
              All Projects
            </Link>
          </aside>
        </div>
      </article>
    </>
  );
}
