import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, MapPin } from "lucide-react";
import type { ProjectRecord } from "@/actions/projects";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";

function parseImages(raw: string): string[] {
  try {
    const images: unknown = JSON.parse(raw || "[]");
    return Array.isArray(images) && images.every((image) => typeof image === "string")
      ? images
      : [];
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

export function Projects({ items }: { items: ProjectRecord[] }) {
  const projects = items.slice(0, 3);

  return (
    <section id="projects" className="section-y container-x">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Our Projects</span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
          Work in motion.
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          See how our welfare initiatives are creating real, lasting impact in
          communities.
        </p>
      </Reveal>

      {projects.length > 0 ? (
        <Stagger className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const images = parseImages(project.images);
            const coverImage = images[0] || "/gallery-food.jpg";

            return (
              <StaggerItem key={project.id}>
                <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:border-primary/40 card-lift">
                  <Link href={`/projects/${project.slug}`} className="block h-full">
                    <div className="relative aspect-4/3 overflow-hidden bg-muted">
                      <Image
                        src={coverImage}
                        alt={project.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary backdrop-blur">
                        {project.status}
                      </span>
                    </div>
                    <div className="p-5 sm:p-6">
                      {project.program && (
                        <span className="mb-2 inline-block text-[10px] font-bold uppercase tracking-widest text-primary">
                          {project.program.title}
                        </span>
                      )}
                      <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                        {project.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {project.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        {project.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {project.location}
                          </span>
                        )}
                        {(project.startDate || project.endDate) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {project.startDate ? formatDate(project.startDate) : ""}
                            {project.startDate && project.endDate ? " – " : ""}
                            {project.endDate ? formatDate(project.endDate) : ""}
                          </span>
                        )}
                      </div>
                      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all group-hover:gap-2">
                        View project <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      ) : (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Our project updates will appear here soon.
        </p>
      )}

      <Reveal className="mt-10 text-center">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          Explore all projects <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </section>
  );
}
