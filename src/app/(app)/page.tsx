import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { ProgramsPreview } from "@/components/sections/ProgramsPreview";
import { Projects } from "@/components/sections/Projects";
import { WhyUs } from "@/components/sections/WhyUs";
import { Stories } from "@/components/sections/Stories";
import { GalleryPreview } from "@/components/sections/GalleryPreview";
import { VolunteerCTA } from "@/components/sections/VolunteerCTA";
import { TeamPreview } from "@/components/sections/TeamPreview";
import { getPublishedPrograms } from "@/actions/programs";
import { getPublishedGalleryItems } from "@/actions/gallery";
import { getPublishedProjects } from "@/actions/projects";
import { getPublishedImpactStories } from "@/actions/impact-stories";
import { getPublicWhoWeAre } from "@/actions/who-we-are";
import { getPublishedTeamProfiles } from "@/actions/team";
import { connection } from "next/server";
import type { Metadata } from "next";
import { CraftedBy } from "@/components/site/CraftedBy";

export const metadata: Metadata = {
  title: {
    absolute: "Wujood Welfare — Zindagi Ko Wujood Do | Faisalabad NGO",
  },
  description: "Wujood Welfare is a Faisalabad-based NGO supporting families with food, healthcare, education, clothing and emergency relief. Donate or volunteer today.",
  openGraph: {
    title: "Wujood Welfare — Zindagi Ko Wujood Do",
    description: "Helping underserved communities through food, medical aid, education, and emergency relief in Pakistan.",
    type: "website",
  },
};

export default async function HomePage() {
  await connection();
  const [publishedPrograms, galleryItems, publishedProjects, impactStories, whoWeAre, teamProfiles] = await Promise.all([
    getPublishedPrograms(),
    getPublishedGalleryItems(),
    getPublishedProjects(),
    getPublishedImpactStories(),
    getPublicWhoWeAre(),
    getPublishedTeamProfiles(),
  ]);

  return (
    <>
      <Hero />
      <About content={whoWeAre.content} values={whoWeAre.values} />
      <ProgramsPreview items={publishedPrograms} />
      <Projects items={publishedProjects} />
      <WhyUs />
      <Stories stories={impactStories} />
      <GalleryPreview items={galleryItems} />
      <TeamPreview profiles={teamProfiles} />
      <VolunteerCTA />
      <CraftedBy />
    </>
  );
}
