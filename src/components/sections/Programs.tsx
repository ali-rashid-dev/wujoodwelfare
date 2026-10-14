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

export const fallbackPrograms = [
  {
    id: "fb-1",
    title: "Food Support",
    category: "Food",
    description:
      "Our Food Support program ensures that no family goes to bed hungry. We provide daily nutritious meals, monthly ration packs, and special Ramadan iftar drives that serve thousands across underserved communities.",
    imageUrl: "/gallery-food.jpg",
    details: [
      "Daily meal distribution at 15+ locations",
      "Monthly ration packs for 500+ families",
      "Ramadan iftar drives — 10,000+ meals served",
      "Special Eid food packages with fresh meat and staples",
    ],
  },
  {
    id: "fb-2",
    title: "Medical Aid",
    category: "Medical",
    description:
      "Wujood Welfare operates free medical camps and clinics in low-income areas where healthcare is a luxury. We provide free check-ups, essential medicines, diagnostic tests, and support for critical treatments.",
    imageUrl: "/gallery-medical.jpg",
    details: [
      "Free medical camps every month",
      "Free medicines at partner pharmacies",
      "Diagnostic test subsidies (blood, ultrasound, X-ray)",
      "Financial aid for surgeries and emergency treatments",
    ],
  },
  {
    id: "fb-3",
    title: "Education Support",
    category: "Education",
    description:
      "Education is the key to breaking the cycle of poverty. Our program covers school fees, provides textbooks, notebooks, uniforms, and stationery to students from low-income families.",
    imageUrl: "/gallery-education.jpg",
    details: [
      "Full school fee coverage for 200+ students",
      "Annual book and stationery kits",
      "Uniform distribution at the start of each academic year",
      "Scholarship awards for high-achieving students",
    ],
  },
  {
    id: "fb-4",
    title: "Clothes Distribution",
    category: "Clothes",
    description:
      "We provide seasonal clothing and essentials to families who cannot afford them. From warm blankets in winter to new Eid clothes for children, our program brings dignity and joy to those in need.",
    imageUrl: "/gallery-clothes.jpg",
    details: [
      "Winter blanket and warm clothing drives",
      "New Eid clothes for 1,000+ children annually",
      "School uniform distribution",
      "Emergency clothing kits for disaster victims",
    ],
  },
  {
    id: "fb-5",
    title: "Awareness Campaigns",
    category: "Awareness",
    description:
      "Knowledge empowers communities. Our campaigns focus on health, hygiene, education, and social issues — conducting workshops and spreading vital information that saves lives and builds resilience.",
    imageUrl: "/gallery-community.jpg",
    details: [
      "Health and hygiene workshops in schools",
      "Vaccination awareness drives",
      "Women's health and maternal care education",
      "Child protection and rights awareness",
    ],
  },
  {
    id: "fb-6",
    title: "Emergency Relief",
    category: "Emergency",
    description:
      "When disaster strikes, Wujood Welfare responds immediately. Our Emergency Relief program delivers food, clean water, medical supplies, temporary shelter, and financial assistance to affected families.",
    imageUrl: "/gallery-volunteers.jpg",
    details: [
      "24/7 emergency response team",
      "Ration packs and clean water distribution",
      "Temporary shelter and tent provisions",
      "Post-disaster rehabilitation support",
    ],
  },
];

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
              <article className="group relative h-full flex flex-col rounded-2xl border border-border bg-card overflow-hidden card-lift shadow-xs hover:border-primary/40 transition-all duration-300">
                {/* Image Header */}
                {p.imageUrl ? (
                  <div className="relative h-48 w-full overflow-hidden bg-muted shrink-0">
                    <Image
                      src={p.imageUrl}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
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
