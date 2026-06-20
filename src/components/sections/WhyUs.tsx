import { ShieldCheck, HeartHandshake, Sprout } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";

const items = [
  { icon: ShieldCheck, title: "Transparency", text: "Every donation is tracked and reported. We publish where each rupee goes." },
  { icon: HeartHandshake, title: "Community Impact", text: "We deliver directly to families in our own neighbourhoods — no middlemen." },
  { icon: Sprout, title: "Sustainable Change", text: "From one-time relief to long-term support, we build systems that last." },
];

export function WhyUs() {
  return (
    <section className="section-y container-x">
      <Reveal className="text-center max-w-2xl mx-auto">
        <span className="eyebrow">Why choose us</span>
        <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Trust, built honestly.</h2>
      </Reveal>
      <Stagger className="mt-12 grid md:grid-cols-3 gap-6">
        {items.map((it) => (
          <StaggerItem key={it.title}>
            <div className="h-full rounded-2xl border border-border bg-card p-8 card-lift text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-gold text-secondary-foreground shadow-gold">
                <it.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.text}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
