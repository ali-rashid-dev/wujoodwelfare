"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Utensils,
  Stethoscope,
  GraduationCap,
  Shirt,
  Megaphone,
  Siren,
  ArrowUpRight,
  Heart,
  Users,
  Coins,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ProgramRecord } from "@/actions/programs";

export const fallbackPrograms = [
  {
    id: "fb-1",
    title: "Food Support",
    category: "Food",
    desc: "Daily meals, ration packs and Ramadan iftar drives for families in need.",
    description:
      "Our Food Support program ensures that no family goes to bed hungry. We provide daily nutritious meals, monthly ration packs containing essential groceries, and special Ramadan iftar drives that serve thousands across underserved communities.",
    imageUrl: "/gallery-food.jpg",
    targetBeneficiaries: 5000,
    currentBeneficiaries: 3420,
    budget: 1500000,
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
    desc: "Free clinics, medicines and life-saving treatment support.",
    description:
      "Wujood Welfare operates free medical camps and clinics in low-income areas where healthcare is a luxury. We provide free check-ups, essential medicines, diagnostic tests, and financial support for critical surgeries and treatments.",
    imageUrl: "/gallery-medical.jpg",
    targetBeneficiaries: 2500,
    currentBeneficiaries: 1850,
    budget: 950000,
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
    desc: "School fees, books and uniforms for deserving students.",
    description:
      "Education is the key to breaking the cycle of poverty. Our Education Support program covers school fees, provides textbooks, notebooks, uniforms, and stationery to students from low-income families, enabling them to stay in school and pursue their dreams.",
    imageUrl: "/gallery-education.jpg",
    targetBeneficiaries: 1000,
    currentBeneficiaries: 620,
    budget: 800000,
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
    desc: "Seasonal clothing, blankets and Eid clothes for children.",
    description:
      "We provide seasonal clothing and essentials to families who cannot afford them. From warm blankets in winter to new Eid clothes for children, our Clothes Distribution program brings dignity and joy to those in need.",
    imageUrl: "/gallery-clothes.jpg",
    targetBeneficiaries: 1200,
    currentBeneficiaries: 1100,
    budget: 600000,
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
    desc: "Health, hygiene and education awareness across communities.",
    description:
      "Knowledge empowers communities. Our Awareness Campaigns focus on health, hygiene, education, and social issues. We conduct workshops, distribute pamphlets, and use community gatherings to spread vital information that saves lives and builds healthier communities.",
    imageUrl: "/gallery-community.jpg",
    targetBeneficiaries: 3000,
    currentBeneficiaries: 2100,
    budget: 350000,
    details: [
      "Health and hygiene workshops in schools and communities",
      "Vaccination awareness drives",
      "Women's health and maternal care education",
      "Child protection and rights awareness",
    ],
  },
  {
    id: "fb-6",
    title: "Emergency Relief",
    category: "Emergency",
    desc: "Rapid response during floods, disasters and crises.",
    description:
      "When disaster strikes, Wujood Welfare is among the first to respond. Our Emergency Relief program provides rapid aid during floods, earthquakes, fires, and other crises — delivering food, clean water, medical supplies, temporary shelter, and financial assistance to affected families.",
    imageUrl: "/gallery-volunteers.jpg",
    targetBeneficiaries: 4000,
    currentBeneficiaries: 4000,
    budget: 2000000,
    details: [
      "24/7 emergency response team",
      "Ration packs and clean water distribution",
      "Temporary shelter and tent provisions",
      "Post-disaster rehabilitation and rebuilding support",
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
  if (
    lower.includes("emerg") ||
    lower.includes("relief") ||
    lower.includes("flood") ||
    lower.includes("disaster")
  )
    return Siren;
  return Utensils;
}

interface DisplayProgram {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string | null;
  targetBeneficiaries?: number;
  currentBeneficiaries?: number;
  budget?: number | null;
  details?: string[];
}

interface ProgramsProps {
  items?: ProgramRecord[];
}

export function Programs({ items }: ProgramsProps) {
  // Use database published programs if available, otherwise fallback
  const displayItems: DisplayProgram[] =
    items && items.length > 0
      ? items.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          description: p.description,
          imageUrl: p.imageUrl,
          targetBeneficiaries: p.targetBeneficiaries,
          currentBeneficiaries: p.currentBeneficiaries,
          budget: p.budget,
        }))
      : fallbackPrograms;

  const [openProgram, setOpenProgram] = useState<DisplayProgram | null>(null);

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
              <article className="group relative h-full flex flex-col justify-between rounded-2xl border border-border bg-card overflow-hidden card-lift shadow-xs hover:border-primary/40 transition-all">
                {/* Image Header if available */}
                {p.imageUrl && (
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
                    <Image
                      src={p.imageUrl}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-secondary/20 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="secondary"
                        className="bg-background/90 backdrop-blur text-xs font-semibold px-2.5 py-0.5 shadow-sm"
                      >
                        {p.category}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {!p.imageUrl && (
                      <div className="flex items-center justify-between mb-4">
                        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-blue text-primary-foreground shadow-blue">
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {p.category}
                        </Badge>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="mt-2.5 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Impact Stats & Action */}
                  <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between">
                    {p.targetBeneficiaries && p.targetBeneficiaries > 0 ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>
                          <strong className="text-foreground">
                            {p.currentBeneficiaries?.toLocaleString() || 0}
                          </strong>{" "}
                          / {p.targetBeneficiaries.toLocaleString()} served
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                        <Heart className="h-3.5 w-3.5 fill-current" />
                        <span>Active Welfare Program</span>
                      </div>
                    )}

                    <button
                      onClick={() => setOpenProgram(p)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                    >
                      Details{" "}
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
                    </button>
                  </div>
                </div>
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* Program Details Modal */}
      <Dialog open={!!openProgram} onOpenChange={() => setOpenProgram(null)}>
        {openProgram && (
          <DialogContent className="max-w-xl p-6 overflow-hidden">
            {openProgram.imageUrl && (
              <div className="relative h-44 sm:h-52 -mx-6 -mt-6 mb-3 overflow-hidden rounded-t-xl bg-muted">
                <Image
                  src={openProgram.imageUrl}
                  alt={openProgram.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary/20 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-6">
                  <Badge className="bg-primary text-primary-foreground font-semibold text-xs">
                    {openProgram.category}
                  </Badge>
                </div>
              </div>
            )}

            <DialogHeader>
              <div className="flex items-center gap-3">
                {!openProgram.imageUrl && (
                  <div className="grid h-10 w-10 place-items-center rounded-lg gradient-blue text-primary-foreground shrink-0">
                    {(() => {
                      const Icon = getCategoryIcon(openProgram.category);
                      return <Icon className="h-5 w-5" />;
                    })()}
                  </div>
                )}
                <DialogTitle className="text-2xl font-bold">
                  {openProgram.title}
                </DialogTitle>
              </div>
              <DialogDescription className="pt-2 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                {openProgram.description}
              </DialogDescription>
            </DialogHeader>

            {/* Metrics highlight */}
            <div className="mt-4 grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Beneficiaries
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {openProgram.currentBeneficiaries?.toLocaleString() || 0} /{" "}
                    {openProgram.targetBeneficiaries?.toLocaleString() || "Goal"}
                  </p>
                </div>
              </div>

              {openProgram.budget && openProgram.budget > 0 && (
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Budget Allocation
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      PKR {openProgram.budget.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {openProgram.details && openProgram.details.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  What we provide:
                </h4>
                <ul className="space-y-2">
                  {openProgram.details.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-3">
              <Link
                href="/volunteer"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Join as Volunteer &rarr;
              </Link>
              <Link
                href="/donate"
                className="inline-flex items-center gap-1.5 rounded-full gradient-gold px-5 py-2 text-xs font-bold text-secondary-foreground shadow-gold hover:-translate-y-0.5 transition-transform"
              >
                <Heart className="h-3.5 w-3.5 fill-current" />
                Support this Program
              </Link>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
