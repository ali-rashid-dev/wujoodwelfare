import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireApprovedVolunteer } from "@/lib/volunteer-access";
import { getVolunteerWorkOpportunities } from "@/actions/work-opportunities";
import { VolunteerDashboardView } from "@/components/dashboard/VolunteerDashboardView";

export const metadata: Metadata = {
  title: "Volunteer Dashboard",
  description: "Wujood Welfare volunteer management and workspace.",
};

export default async function VolunteerDashboardPage() {
  const [user, opportunities] = await Promise.all([
    requireApprovedVolunteer(),
    getVolunteerWorkOpportunities(),
  ]);
  const availableOpportunities = opportunities
    .filter((opportunity) =>
      opportunity.status === "open" && !opportunity.full && !opportunity.participation,
    )
    .slice(0, 3);
  const [pendingResponses, acceptedAssignments, currentWork, completedAssignments, assignments] =
    await Promise.all([
      prisma.volunteerAssignment.count({
        where: { userId: user.id, status: "pending" },
      }),
      prisma.volunteerAssignment.count({
        where: { userId: user.id, status: "accepted" },
      }),
      prisma.volunteerAssignment.count({
        where: { userId: user.id, status: "in_progress" },
      }),
      prisma.volunteerAssignment.count({
        where: { userId: user.id, status: "completed" },
      }),
      prisma.volunteerAssignment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          deadline: true,
          location: true,
          createdAt: true,
        },
      }),
    ]);

  return (
    <VolunteerDashboardView
      assignments={assignments}
      availableOpportunities={availableOpportunities}
      volunteerName={user.name}
      stats={{
        pendingResponses,
        acceptedAssignments,
        currentWork,
        completedAssignments,
      }}
    />
  );
}
