import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Programs } from "@/components/sections/Programs";
import { Impact } from "@/components/sections/Impact";
import { Campaign } from "@/components/sections/Campaign";
import { WhyUs } from "@/components/sections/WhyUs";
import { Stories } from "@/components/sections/Stories";
import { Gallery } from "@/components/sections/Gallery";
import { VolunteerCTA } from "@/components/sections/VolunteerCTA";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Wujood Welfare — Zindagi Ko Wujood Do | Faisalabad NGO",
  description: "Wujood Welfare is a Faisalabad-based NGO supporting families with food, healthcare, education, clothing and emergency relief. Donate or volunteer today.",
  openGraph: {
    title: "Wujood Welfare — Zindagi Ko Wujood Do",
    description: "Helping underserved communities through food, medical aid, education, and emergency relief in Pakistan.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Programs />
      <Impact />
      <Campaign />
      <WhyUs />
      <Stories />
      <Gallery />
      <VolunteerCTA />
    </>
  );
}
