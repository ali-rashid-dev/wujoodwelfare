"use client";
import { useState } from "react";
import { Utensils, Stethoscope, GraduationCap, Shirt, Megaphone, Siren, ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const programs = [
  {
    icon: Utensils,
    title: "Food Support",
    desc: "Daily meals, ration packs and Ramadan iftar drives for families in need.",
    emoji: "🥣",
    longDesc: "Our Food Support program ensures that no family goes to bed hungry. We provide daily nutritious meals, monthly ration packs containing essential groceries, and special Ramadan iftar drives that serve thousands across underserved communities.",
    details: ["Daily meal distribution at 15+ locations", "Monthly ration packs for 500+ families", "Ramadan iftar drives — 10,000+ meals served", "Special Eid food packages with fresh meat and staples"],
  },
  {
    icon: Stethoscope,
    title: "Medical Aid",
    desc: "Free clinics, medicines and life-saving treatment support.",
    emoji: "💊",
    longDesc: "Wujood Welfare operates free medical camps and clinics in low-income areas where healthcare is a luxury. We provide free check-ups, essential medicines, diagnostic tests, and financial support for critical surgeries and treatments.",
    details: ["Free medical camps every month", "Free medicines at partner pharmacies", "Diagnostic test subsidies (blood, ultrasound, X-ray)", "Financial aid for surgeries and emergency treatments"],
  },
  {
    icon: GraduationCap,
    title: "Education Support",
    desc: "School fees, books and uniforms for deserving students.",
    emoji: "🎓",
    longDesc: "Education is the key to breaking the cycle of poverty. Our Education Support program covers school fees, provides textbooks, notebooks, uniforms, and stationery to students from low-income families, enabling them to stay in school and pursue their dreams.",
    details: ["Full school fee coverage for 200+ students", "Annual book and stationery kits", "Uniform distribution at the start of each academic year", "Scholarship awards for high-achieving students"],
  },
  {
    icon: Shirt,
    title: "Clothes Distribution",
    desc: "Seasonal clothing, blankets and Eid clothes for children.",
    emoji: "👕",
    longDesc: "We provide seasonal clothing and essentials to families who cannot afford them. From warm blankets in winter to new Eid clothes for children, our Clothes Distribution program brings dignity and joy to those in need.",
    details: ["Winter blanket and warm clothing drives", "New Eid clothes for 1,000+ children annually", "School uniform distribution", "Emergency clothing kits for disaster victims"],
  },
  {
    icon: Megaphone,
    title: "Awareness Campaigns",
    desc: "Health, hygiene and education awareness across communities.",
    emoji: "🧠",
    longDesc: "Knowledge empowers communities. Our Awareness Campaigns focus on health, hygiene, education, and social issues. We conduct workshops, distribute pamphlets, and use community gatherings to spread vital information that saves lives and builds healthier communities.",
    details: ["Health and hygiene workshops in schools and communities", "Vaccination awareness drives", "Women's health and maternal care education", "Child protection and rights awareness"],
  },
  {
    icon: Siren,
    title: "Emergency Relief",
    desc: "Rapid response during floods, disasters and crises.",
    emoji: "🚨",
    longDesc: "When disaster strikes, Wujood Welfare is among the first to respond. Our Emergency Relief program provides rapid aid during floods, earthquakes, fires, and other crises — delivering food, clean water, medical supplies, temporary shelter, and financial assistance to affected families.",
    details: ["24/7 emergency response team", "Ration packs and clean water distribution", "Temporary shelter and tent provisions", "Post-disaster rehabilitation and rebuilding support"],
  },
];

export function Programs() {
  const [openProgram, setOpenProgram] = useState<typeof programs[number] | null>(null);

  return (
    <section id="programs" className="section-y container-x">
      <Reveal className="max-w-2xl">
        <span className="eyebrow">What we do</span>
        <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Our core programs</h2>
        <p className="mt-4 text-muted-foreground">
          Six focused programs designed to meet immediate needs and build long-term
          resilience for the families we serve.
        </p>
      </Reveal>

      <Stagger className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {programs.map((p) => (
          <StaggerItem key={p.title}>
            <article className="group relative h-full rounded-2xl border border-border bg-card p-7 card-lift overflow-hidden">
              <div aria-hidden className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-secondary/10 group-hover:bg-secondary/30 transition-colors" />
              <div className="relative">
                <div className="grid h-14 w-14 place-items-center rounded-xl gradient-blue text-primary-foreground shadow-blue">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                <button
                  onClick={() => setOpenProgram(p)}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-primary-dark cursor-pointer"
                >
                  Learn more <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </button>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      <Dialog open={!!openProgram} onOpenChange={() => setOpenProgram(null)}>
        {openProgram && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg gradient-blue text-primary-foreground">
                  <openProgram.icon className="h-5 w-5" />
                </div>
                <DialogTitle>{openProgram.title}</DialogTitle>
              </div>
              <DialogDescription className="pt-2 text-base leading-relaxed">
                {openProgram.longDesc}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              <h4 className="text-sm font-semibold mb-2">What we provide:</h4>
              <ul className="space-y-2">
                {openProgram.details.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
