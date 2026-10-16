import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireApprovedVolunteer } from "@/lib/volunteer-access";
import { VolunteerAssignmentDetails } from "@/components/dashboard/VolunteerAssignmentDetails";

export const metadata: Metadata = {
  title: "Assignment Details",
  description: "Review instructions and update the status of your assignment.",
};

export default async function VolunteerAssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const [{ assignmentId }, user] = await Promise.all([
    params,
    requireApprovedVolunteer(),
  ]);

  const assignment = await prisma.volunteerAssignment.findFirst({
    where: { id: assignmentId, userId: user.id },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      status: true,
      priority: true,
      deadline: true,
      createdAt: true,
      volunteerNotes: true,
    },
  });

  if (!assignment) notFound();

  return <VolunteerAssignmentDetails assignment={assignment} />;
}
