import { Target, Eye, Sparkles } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import Image from "next/image";

const values = [
  { icon: Target, title: "Mission", text: "To uplift underserved families with food, healthcare, education and emergency relief — restoring dignity and hope." },
  { icon: Eye, title: "Vision", text: "A Pakistan where no child sleeps hungry, no patient is left untreated, and every family has a path forward." },
  { icon: Sparkles, title: "Core Values", text: "Transparency, compassion, accountability and long-term community impact in everything we do." },
];

export function About() {
  return (
    <section id="about" className="section-y container-x grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <Reveal className="relative">
        <div className="absolute -inset-4 -z-10 rounded-3xl bg-linear-to-br from-secondary/30 to-primary/20 blur-2xl" />
        <div className="relative rounded-3xl overflow-hidden shadow-blue border border-border">
          <Image
            src="/about-story.jpg"
            alt="Volunteers planting a sapling together"
            width={1280}
            height={1280}
            loading="lazy"
            className="w-full aspect-4/5 object-cover"
          />
        </div>
        <div className="absolute -bottom-6 -right-6 hidden md:flex flex-col items-center justify-center h-32 w-32 rounded-2xl gradient-gold shadow-gold">
          <span className="text-3xl font-bold text-secondary-foreground">5+</span>
          <span className="text-xs font-semibold text-secondary-foreground/80 uppercase tracking-wider">Years</span>
        </div>
      </Reveal>

      <div>
        <Reveal>
          <span className="eyebrow">Who we are</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
            Restoring dignity, one family at a time.
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Founded in Faisalabad, Wujood Welfare exists to support families who are
            often forgotten. From hot meals during Ramadan to medical camps in
            underserved neighbourhoods, our work is local, personal, and built on
            trust earned door-by-door.
          </p>
        </Reveal>

        <div className="mt-8 space-y-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i}>
              <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 card-lift">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-blue text-primary-foreground">
                  <v.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{v.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
