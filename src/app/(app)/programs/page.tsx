import { PageHero } from "@/components/site/SiteLayout";
import { Programs } from "@/components/sections/Programs";
import { Campaign } from "@/components/sections/Campaign";
import { Impact } from "@/components/sections/Impact";
import { getPublishedPrograms } from "@/actions/programs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore our welfare initiatives: food distribution, medical clinics, education sponsorships, clothing drives, and disaster relief.",
  openGraph: {
    title: "Programs — Wujood Welfare",
    description:
      "Dedicated welfare programs serving Pakistan's underserved families.",
  },
  alternates: {
    canonical: "/programs",
  },
};

export default async function ProgramsPage() {
  const publishedPrograms = await getPublishedPrograms();

  return (
    <>
      <PageHero
        eyebrow="Our Programs"
        title="Changing lives across communities."
        subtitle="From hot meals and medicine to school books and emergency relief — our programs meet people where they are."
      />

      <Programs items={publishedPrograms} />
    </>
  );
}
