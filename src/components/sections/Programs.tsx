"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Utensils,
  Stethoscope,
  GraduationCap,
  Shirt,
  Megaphone,
  Siren,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import type { ProgramRecord } from "@/actions/programs";
import { fallbackPrograms } from "@/components/sections/programs-data";

export function getCategoryIcon(cat: string) {
  const lower = cat.toLowerCase();
  if (lower.includes("food") || lower.includes("ration") || lower.includes("meal"))
    return Utensils;
  if (lower.includes("medic") || lower.includes("health") || lower.includes("clinic"))
    return Stethoscope;
  if (lower.includes("edu") || lower.includes("school") || lower.includes("literacy"))
    return GraduationCap;
  if (lower.includes("cloth") || lower.includes("winter") || lower.includes("blanket"))
    return Shirt;
  if (lower.includes("aware") || lower.includes("campaign") || lower.includes("hygiene"))
    return Megaphone;
  if (lower.includes("emerg") || lower.includes("relief") || lower.includes("disaster"))
    return Siren;
  return Utensils;
}

interface DisplayProgram {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string | null;
  details?: string[];
}

interface ProgramsProps {
  items?: ProgramRecord[];
}

export function Programs({ items }: ProgramsProps) {
  const displayItems: DisplayProgram[] =
    items && items.length > 0
      ? items.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          description: p.description,
          imageUrl: p.imageUrl,
        }))
      : fallbackPrograms;

  return (
    <section id="programs" className="section-y container-x">
      <Reveal className="max-w-2xl">
        <span className="eyebrow">What we do</span>
        <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
          Our core programs
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Focused welfare programs designed to meet immediate survival needs and build
          long-term resilience for vulnerable families.
        </p>
      </Reveal>

      <Stagger className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayItems.map((p) => {
          const Icon = getCategoryIcon(p.category);

          return (
            <StaggerItem key={p.id}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-[border-color,box-shadow] duration-150 card-lift hover:border-primary/40">
                {/* Image Header */}
                {p.imageUrl ? (
                  <div className="relative h-48 w-full overflow-hidden bg-muted shrink-0">
                    <Image
                      src={p.imageUrl}
                      alt={p.title}
                      fill
                      className="image-hover-zoom object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="secondary"
                        className="bg-background/90 backdrop-blur text-xs font-semibold px-2.5 py-0.5 shadow-sm"
                      >
                        {p.category}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 w-full bg-primary/5 flex items-center px-6 shrink-0">
                    <div className="grid h-12 w-12 place-items-center rounded-xl gradient-blue text-primary-foreground shadow-blue">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {p.category}
                    </Badge>
                  </div>
                )}

                {/* Card Body */}
                <div className="flex flex-col flex-1 p-6">
                  {/* Icon for image cards (small inline) */}
                  {p.imageUrl && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg gradient-blue text-primary-foreground shadow-blue shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>

                  <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>

                  {/* Detail bullets if available */}
                  {p.details && p.details.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {p.details.map((d) => (
                        <li
                          key={d}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Footer CTA */}
                  <div className="mt-auto pt-5 border-t border-border/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                      <Heart className="h-3.5 w-3.5 fill-current" />
                      <span>Active Program</span>
                    </div>
                    <Link
                      href="/donate"
                      className="inline-flex items-center gap-1.5 rounded-full gradient-gold px-4 py-1.5 text-xs font-bold text-secondary-foreground shadow-gold hover:-translate-y-0.5 transition-transform"
                    >
                      <Heart className="h-3 w-3 fill-current" />
                      Support
                    </Link>
                  </div>
                </div>
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* Section CTA */}
      <Reveal className="mt-14 text-center">
        <p className="text-muted-foreground text-sm mb-4">
          Want to make a difference? Join us as a volunteer or support a program financially.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/volunteer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            Join as Volunteer →
          </Link>
          <Link
            href="/donate"
            className="inline-flex items-center gap-2 rounded-full gradient-gold px-6 py-2.5 text-sm font-bold text-secondary-foreground shadow-gold hover:-translate-y-0.5 transition-transform"
          >
            <Heart className="h-4 w-4 fill-current" />
            Donate Now
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
