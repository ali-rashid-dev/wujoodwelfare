import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireApprovedVolunteer } from "@/lib/volunteer-access";
import { VolunteerDashboardView } from "@/components/dashboard/VolunteerDashboardView";

export const metadata: Metadata = {
  title: "Volunteer Dashboard",
  description: "Wujood Welfare volunteer management and workspace.",
};

export default async function VolunteerDashboardPage() {
  const user = await requireApprovedVolunteer();
  const assignments = await prisma.volunteerAssignment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      deadline: true,
      location: true,
      createdAt: true,
    },
  });

  return (
    <VolunteerDashboardView assignments={assignments} volunteerName={user.name} />
  );
}
