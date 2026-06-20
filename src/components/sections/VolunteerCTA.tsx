import { Reveal } from "@/components/site/Reveal";
import { ArrowRight, HandHeart } from "lucide-react";
import Link from "next/link";

export function VolunteerCTA() {
  return (
    <section className="section-y container-x">
      <div className="relative overflow-hidden rounded-3xl gradient-blue p-10 md:p-16 text-primary-foreground">
        <div aria-hidden className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
        <Reveal className="relative max-w-2xl">
          <span className="inline-block rounded-full bg-secondary/20 text-secondary px-3 py-1 text-xs font-semibold uppercase tracking-widest">Join us</span>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold leading-tight">
            Become the reason someone smiles today.
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Give a few hours of your week to deliver meals, teach a child, or run a
            medical camp. Volunteers are the heart of everything we do.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/volunteer" className="inline-flex items-center gap-2 rounded-full gradient-gold px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-gold hover:-translate-y-0.5 transition-transform">
              <HandHeart className="h-4 w-4" /> Become a Volunteer <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/5 px-6 py-3 text-sm font-semibold hover:bg-primary-foreground/10">
              Talk to our team
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
