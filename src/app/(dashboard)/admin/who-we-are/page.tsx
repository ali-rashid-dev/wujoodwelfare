import type { Metadata } from "next";
import { Info } from "lucide-react";
import { getAdminWhoWeAre } from "@/actions/who-we-are";
import { WhoWeAreManagement } from "@/components/dashboard/who-we-are/WhoWeAreManagement";

export const metadata: Metadata = {
  title: "Who We Are",
  description: "Manage the public Who We Are section and its mission, vision, and values.",
};

export default async function AdminWhoWeArePage() {
  const { content, values } = await getAdminWhoWeAre();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Info className="h-3.5 w-3.5" />
          Administrative Console
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Who We Are
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Update the About section shown on the homepage and About page, and manage
          the Mission, Vision, and values cards.
        </p>
      </div>

      <WhoWeAreManagement initialContent={content} initialValues={values} />
    </div>
  );
}
