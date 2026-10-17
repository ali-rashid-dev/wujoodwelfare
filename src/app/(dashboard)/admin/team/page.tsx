import type { Metadata } from "next";
import { Users } from "lucide-react";
import { getAdminTeamManagementData } from "@/actions/team";
import { TeamManagement } from "@/components/dashboard/team/TeamManagement";

export const metadata: Metadata = {
  title: "Team Management",
  description: "Manage team profiles and choose which appear in Top Leadership.",
};

export default async function AdminTeamPage() {
  const initialData = await getAdminTeamManagementData();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Users className="h-3.5 w-3.5" />
          Administrative Console
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Team Management
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Manage team profiles and choose which members appear in Top Leadership. Team membership
          does not grant application access or change account roles.
        </p>
      </div>

      <TeamManagement initialData={initialData} />
    </div>
  );
}
