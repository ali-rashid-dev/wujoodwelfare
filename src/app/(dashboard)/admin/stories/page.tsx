import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { getAdminImpactStories } from "@/actions/impact-stories";
import { ImpactStoriesManagement } from "@/components/dashboard/stories/ImpactStoriesManagement";

export const metadata: Metadata = {
  title: "Stories of Impact",
  description: "Create, publish, and manage stories of community impact.",
};

export default async function AdminImpactStoriesPage() {
  const stories = await getAdminImpactStories();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Quote className="h-3.5 w-3.5" />
          Administrative Console
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Stories of Impact
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Share first-hand stories about the people and communities supported by
          Wujood Welfare. Published stories appear in the public impact carousel.
        </p>
      </div>

      <ImpactStoriesManagement initialStories={stories} />
    </div>
  );
}
