import type { Metadata } from "next";
import { getAdminProjects } from "@/actions/projects";
import { ProjectsManagementTable } from "@/components/dashboard/projects/ProjectsManagementTable";
import { Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects Management",
  description: "Create, publish, and manage Wujood Welfare projects.",
};

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <Layers className="h-3.5 w-3.5" />
          Administrative Console
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Projects Management
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Create, edit, and publish welfare projects. Link them to programs for better
          organisation. Only <strong>Published</strong> projects appear on the public
          website — unpublished projects remain hidden from visitors.
        </p>
      </div>

      {/* Main Table Interface */}
      <ProjectsManagementTable initialProjects={projects} />
    </div>
  );
}
