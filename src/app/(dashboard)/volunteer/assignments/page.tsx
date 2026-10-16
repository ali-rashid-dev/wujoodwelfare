import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireApprovedVolunteer } from "@/lib/volunteer-access";
import { VolunteerAssignments } from "@/components/dashboard/VolunteerAssignments";

export const metadata: Metadata = {
  title: "My Assignments",
  description: "Review and manage your Wujood Welfare volunteer assignments.",
};

const assignmentViews = ["all", "available", "active", "completed", "rejected"] as const;
type AssignmentView = (typeof assignmentViews)[number];

export default async function VolunteerAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const [user, params] = await Promise.all([
    requireApprovedVolunteer(),
    searchParams,
  ]);
  const initialView: AssignmentView = assignmentViews.includes(
    params.view as AssignmentView,
  )
    ? (params.view as AssignmentView)
    : "all";

  const assignments = await prisma.volunteerAssignment.findMany({
    where: { userId: user.id },
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      status: true,
      priority: true,
      deadline: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Volunteer workspace</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Assignments</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review new requests, manage accepted work, and revisit completed assignments.
        </p>
      </div>
      <VolunteerAssignments assignments={assignments} initialView={initialView} />
    </div>
  );
}
