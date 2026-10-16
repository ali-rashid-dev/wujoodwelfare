import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { requireApprovedVolunteer } from "@/lib/volunteer-access";
import { VolunteerProfileForm } from "@/components/dashboard/VolunteerProfileForm";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your volunteer contact details and skills.",
};

export default async function VolunteerProfilePage() {
  const user = await requireApprovedVolunteer();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <UserRound className="h-3.5 w-3.5" />
          Volunteer profile
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Keep your contact details and skills current so coordinators can match you with work.
        </p>
      </div>

      <VolunteerProfileForm
        profile={{
          name: user.volunteerApplication.name,
          email: user.volunteerApplication.email,
          phone: user.volunteerApplication.phone,
          city: user.volunteerApplication.city,
          skills: user.volunteerApplication.skills,
        }}
      />
    </div>
  );
}
