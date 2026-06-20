import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Gallery } from "@/components/sections/Gallery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery — Wujood Welfare",
  description:
    "Photos from food drives, medical camps, education support and volunteer activities.",
  openGraph: {
    title: "Gallery — Wujood Welfare",
    description: "Moments from our welfare work across Pakistan.",
  },
  alternates: {
    canonical: "/gallery",
  },
};

export default function GalleryPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Gallery"
        title="Moments worth a thousand thanks."
      />
      <Gallery />
    </SiteLayout>
  );
}
