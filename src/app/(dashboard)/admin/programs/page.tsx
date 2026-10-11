import type { Metadata } from "next";
import { getAdminPrograms } from "@/actions/programs";
import { ProgramsManagementTable } from "@/components/dashboard/programs/ProgramsManagementTable";
import { Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Programs Management",
  description: "Create, publish, and manage Wujood Welfare programs.",
};

export default async function AdminProgramsPage() {
  const programs = await getAdminPrograms();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <Calendar className="h-3.5 w-3.5" />
          Administrative Console
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Programs Management
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Create, edit, organize, and publish welfare initiatives. Only programs marked with &ldquo;Published&rdquo; status will be showcased on the public website.
        </p>
      </div>

      {/* Main Table Interface */}
      <ProgramsManagementTable initialPrograms={programs} />
    </div>
  );
}
