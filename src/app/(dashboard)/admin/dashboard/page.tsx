import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminDashboardView } from "@/components/dashboard/AdminDashboardView";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Wujood Welfare administrative management portal.",
};

export default async function AdminDashboardPage() {
  const [
    approvedVolunteers,
    pendingApplications,
    activePrograms,
    activeProjects,
    assignmentsInProgress,
    completedAssignments,
    unresolvedMessages,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: "volunteer",
        volunteerApplications: { some: { status: "approved" } },
      },
    }),
    prisma.volunteerApplication.count({ where: { status: "pending" } }),
    prisma.program.count({ where: { status: "active" } }),
    prisma.project.count({ where: { status: "active" } }),
    prisma.volunteerAssignment.count({
      where: { status: "in_progress", user: { role: "volunteer" } },
    }),
    prisma.volunteerAssignment.count({
      where: { status: "completed", user: { role: "volunteer" } },
    }),
    prisma.contactMessage.count({
      where: { status: { in: ["new", "in_progress"] } },
    }),
  ]);

  return (
    <AdminDashboardView
      stats={{
        approvedVolunteers,
        pendingApplications,
        activePrograms,
        activeProjects,
        assignmentsInProgress,
        completedAssignments,
        unresolvedMessages,
      }}
    />
  );
}
