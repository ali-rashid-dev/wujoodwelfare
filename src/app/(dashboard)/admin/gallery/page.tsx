import type { Metadata } from "next";
import { Image as ImageIcon } from "lucide-react";
import {
  getAdminGalleryItems,
  getGalleryProjects,
} from "@/actions/gallery";
import { GalleryManagement } from "@/components/dashboard/gallery/GalleryManagement";

export const metadata: Metadata = {
  title: "Gallery Management",
  description: "Upload, publish, and manage welfare activity photos.",
};

export default async function AdminGalleryPage() {
  const [items, projects] = await Promise.all([
    getAdminGalleryItems(),
    getGalleryProjects(),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ImageIcon className="h-3.5 w-3.5" />
          Administrative Console
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Gallery Management
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Upload photos documenting welfare activities, add captions, and
          optionally link them to projects. Only published images appear on the
          public website.
        </p>
      </div>

      <GalleryManagement initialItems={items} projects={projects} />
    </div>
  );
}
