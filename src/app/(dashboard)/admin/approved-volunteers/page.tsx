import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { getAdminVolunteerManagement } from "@/actions/volunteers";
import { ApprovedVolunteersManagement } from "@/components/dashboard/ApprovedVolunteersManagement";

export const metadata: Metadata = {
  title: "Approved Volunteer Management",
  description: "Manage approved volunteer profiles, account access, and assignments.",
};

export default async function AdminApprovedVolunteersPage() {
  const { volunteers } = await getAdminVolunteerManagement();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <BadgeCheck className="h-3.5 w-3.5" />
          Administrative Console
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Approved Volunteer Management
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Review approved profiles, control volunteer portal access, and manage assignments.
        </p>
      </div>

      <ApprovedVolunteersManagement volunteers={volunteers} />
    </div>
  );
}
