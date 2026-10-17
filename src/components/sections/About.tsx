import { Target, Eye, Sparkles, Heart, HandHeart, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import Image from "next/image";
import { MOTION_STAGGER_DELAY } from "@/lib/motion";

const valueIcons = {
  target: Target,
  eye: Eye,
  sparkles: Sparkles,
  heart: Heart,
  "hand-heart": HandHeart,
  "shield-check": ShieldCheck,
};

type WhoWeAreContent = {
  heading: string;
  description: string;
  imageUrl: string;
  yearsExperience: number;
};

type WhoWeAreValue = {
  id: string;
  title: string;
  text: string;
  icon: string;
};

export function About({
  content,
  values,
}: {
  content: WhoWeAreContent;
  values: WhoWeAreValue[];
}) {
  return (
    <section id="about" className="section-y container-x grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <Reveal className="relative">
        <div className="absolute -inset-4 -z-10 rounded-3xl bg-linear-to-br from-secondary/30 to-primary/20 blur-2xl" />
        <div className="relative rounded-3xl overflow-hidden shadow-blue border border-border">
          <Image
            src={content.imageUrl}
            alt="Volunteers planting a sapling together"
            width={1280}
            height={1280}
            loading="lazy"
            className="w-full aspect-4/5 object-cover"
          />
        </div>
        <div className="absolute -bottom-6 -right-6 hidden md:flex flex-col items-center justify-center h-32 w-32 rounded-2xl gradient-gold shadow-gold">
          <span className="text-3xl font-bold text-secondary-foreground">{content.yearsExperience}+</span>
          <span className="text-xs font-semibold text-secondary-foreground/80 uppercase tracking-wider">Years</span>
        </div>
      </Reveal>

      <div>
        <Reveal>
          <span className="eyebrow">Who we are</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
            {content.heading}
          </h2>
          <p className="mt-5 whitespace-pre-line text-muted-foreground leading-relaxed">
            {content.description}
          </p>
        </Reveal>

        <div className="mt-8 space-y-4">
          {values.map((value, i) => {
            const Icon = valueIcons[value.icon as keyof typeof valueIcons] ?? Sparkles;
            return (
            <Reveal key={value.id} delay={i * MOTION_STAGGER_DELAY}>
              <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 card-lift">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-blue text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{value.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{value.text}</p>
                </div>
              </div>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
