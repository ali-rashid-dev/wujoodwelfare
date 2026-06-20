import { VolunteerApplicationForm } from "@/components/sections/VolunteerApplicationForm";
import { Reveal } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/SiteLayout";
import { Check, HandHeart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Volunteer — Wujood Welfare",
  description:
    "Join the Wujood Welfare volunteer team in Faisalabad. Help deliver food, run medical camps and support education.",
  openGraph: {
    title: "Volunteer with Wujood Welfare",
    description: "Become the reason someone smiles today.",
  },
  alternates: {
    canonical: "/volunteer",
  },
};

export default function VolunteerPage() {
  return (
    <>
      <PageHero
        eyebrow="Volunteer"
        title="Become the reason someone smiles today."
        subtitle="Give a few hours. Change a life. Join 100+ volunteers across Pakistan."
      />

      <section className="section-y container-x grid lg:grid-cols-5 gap-10">
        <Reveal className="lg:col-span-2">
          <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-gold text-secondary-foreground shadow-gold">
            <HandHeart className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-2xl md:text-3xl font-bold">
            Why volunteer?
          </h2>

          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {[
              "Be part of a trusted local team",
              "Flexible weekly commitment",
              "Hands-on community work",
              "Training and mentorship",
              "Certificates of contribution",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-secondary text-secondary-foreground mt-0.5">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={1} className="lg:col-span-3">
          <VolunteerApplicationForm />
        </Reveal>
      </section>
    </>
  );
}
