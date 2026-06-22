import {  PageHero } from "@/components/site/SiteLayout";
import { About } from "@/components/sections/About";
import { WhyUs } from "@/components/sections/WhyUs";
import { Stories } from "@/components/sections/Stories";
import { TeamHierarchy } from "@/components/sections/TeamHierarchy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wujood Welfare — About Us",
  description:
    "Our mission, vision and values. Learn how Wujood Welfare serves Faisalabad's most vulnerable families.",
  openGraph: {
    title: "About Wujood Welfare",
    description: "Restoring dignity, one family at a time.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="A welfare home built on trust."
        subtitle="Local, transparent and human-centered. Born in Faisalabad, growing across Pakistan."
      />
      <About />
      <WhyUs />
      <TeamHierarchy />
      <Stories />
    </>
  );
}
