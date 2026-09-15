import { PageHero } from "@/components/site/SiteLayout";
import { Programs } from "@/components/sections/Programs";
import { Campaign } from "@/components/sections/Campaign";
import { Impact } from "@/components/sections/Impact";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wujood Welfare — Programs",
  description:
    "Six focused welfare programs: food, medical, education, clothes, awareness and emergency relief.",
  openGraph: {
    title: "Programs — Wujood Welfare",
    description:
      "Six focused welfare programs serving Pakistan's underserved communities.",
  },
  alternates: {
    canonical: "/programs",
  },
};

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Programs"
        title="Six ways we change lives."
        subtitle="From a hot meal at sunset to a child's first uniform — our programs meet people where they are."
      />

      <Programs />
      <Impact />
      <Campaign />
    </>
  );
}
