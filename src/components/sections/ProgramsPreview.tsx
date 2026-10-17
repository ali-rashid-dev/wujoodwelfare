import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import type { ProgramRecord } from "@/actions/programs";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { fallbackPrograms } from "@/components/sections/programs-data";

export function ProgramsPreview({ items }: { items: ProgramRecord[] }) {
  const programs =
    items.length > 0
      ? items.slice(0, 3).map((program) => ({
          id: program.id,
          title: program.title,
          category: program.category,
          description: program.description,
          imageUrl: program.imageUrl,
        }))
      : fallbackPrograms.slice(0, 3);

  return (
    <section className="section-y container-x">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">What we do</span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
          Our core programs
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Focused welfare programs meeting immediate needs and building long-term
          resilience for vulnerable families.
        </p>
      </Reveal>

      <Stagger className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <StaggerItem key={program.id}>
            <article className="group card-lift h-full overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-primary/40">
              {program.imageUrl && (
                <div className="relative h-48 overflow-hidden bg-muted">
                  <Image
                    src={program.imageUrl}
                    alt={program.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="image-hover-zoom object-cover"
                  />
                  <Badge
                    variant="secondary"
                    className="absolute right-3 top-3 bg-background/90 text-xs shadow-sm backdrop-blur"
                  >
                    {program.category}
                  </Badge>
                </div>
              )}
              <div className="p-5 sm:p-6">
                {!program.imageUrl && (
                  <Badge variant="secondary" className="mb-3 text-xs">
                    {program.category}
                  </Badge>
                )}
                <h3 className="text-lg font-bold transition-colors group-hover:text-primary">
                  {program.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {program.description}
                </p>
                <Link
                  href="/donate"
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full gradient-gold px-4 py-2 text-xs font-bold text-secondary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
                >
                  <Heart className="h-3.5 w-3.5 fill-current" />
                  Support this work
                </Link>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-8 text-center">
        <Link
          href="/programs"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          Explore all programs <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </section>
  );
}
