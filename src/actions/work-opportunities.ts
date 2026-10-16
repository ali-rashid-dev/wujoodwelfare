"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { requireApprovedVolunteer } from "@/lib/volunteer-access";

const participationStatuses = ["accepted", "in_progress", "completed"] as const;
const opportunityStatuses = ["draft", "open", "closed", "cancelled", "completed"] as const;

const opportunityFieldsSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(5000),
  location: z.string().trim().min(2).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date."),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid start time."),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid end time."),
  spotsNeeded: z.coerce.number().int().min(1).max(1000),
});

function validOpportunityDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
}

function validOpportunitySchedule({
  date,
  startTime,
  endTime,
}: {
  date: string;
  startTime: string;
  endTime: string;
}) {
  return validOpportunityDate(date) && startTime < endTime;
}

const opportunityInputSchema = opportunityFieldsSchema.extend({
  publish: z.boolean(),
}).refine(
  validOpportunitySchedule,
  { message: "Enter a valid date and an end time after the start time.", path: ["endTime"] },
);

const opportunityUpdateSchema = opportunityFieldsSchema.extend({
  id: z.string().trim().min(1).max(128),
}).refine(
  validOpportunitySchedule,
  { message: "Enter a valid date and an end time after the start time.", path: ["endTime"] },
);

function refreshOpportunityPages() {
  revalidatePath("/admin/opportunities");
  revalidatePath("/volunteer/opportunities");
  revalidatePath("/volunteer/assignments");
  revalidatePath("/volunteer/dashboard");
  revalidatePath("/admin/dashboard");
}

function formatTimeCommitment(startTime: string, endTime: string) {
  return `${startTime} - ${endTime}`;
}

function toOpportunityData(
  input: z.infer<typeof opportunityFieldsSchema>,
) {
  return {
    title: input.title,
    category: input.category,
    description: input.description,
    location: input.location,
    date: new Date(`${input.date}T00:00:00.000Z`),
    startTime: input.startTime,
    endTime: input.endTime,
    timeCommitment: formatTimeCommitment(input.startTime, input.endTime),
    spotsNeeded: input.spotsNeeded,
  };
}

function getOccupiedCount(spotsFilled: number | null, participantCount: number) {
  return Math.max(spotsFilled ?? 0, participantCount);
}

export async function getAdminWorkOpportunities() {
  await requireAdmin();
  const opportunities = await prisma.volunteerOpportunity.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      location: true,
      date: true,
      startTime: true,
      endTime: true,
      timeCommitment: true,
      spotsNeeded: true,
      spotsFilled: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      assignments: {
        where: { status: { in: [...participationStatuses] } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return opportunities.map((opportunity) => {
    const acceptedCount = getOccupiedCount(
      opportunity.spotsFilled,
      opportunity.assignments.length,
    );
    return {
      ...opportunity,
      acceptedCount,
      remainingPositions: Math.max(opportunity.spotsNeeded - acceptedCount, 0),
    };
  });
}

export async function getVolunteerWorkOpportunities() {
  const user = await requireApprovedVolunteer();
  const opportunities = await prisma.volunteerOpportunity.findMany({
    where: { status: { in: ["open", "closed", "cancelled", "completed"] } },
    orderBy: [{ date: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      location: true,
      date: true,
      startTime: true,
      endTime: true,
      timeCommitment: true,
      spotsNeeded: true,
      spotsFilled: true,
      status: true,
      assignments: {
        where: { userId: user.id },
        select: { id: true, status: true },
        take: 1,
      },
      _count: {
        select: {
          assignments: {
            where: { status: { in: [...participationStatuses] } },
          },
        },
      },
    },
  });

  return opportunities.map((opportunity) => {
    const acceptedCount = getOccupiedCount(
      opportunity.spotsFilled,
      opportunity._count.assignments,
    );
    return {
      id: opportunity.id,
      title: opportunity.title,
      category: opportunity.category,
      description: opportunity.description,
      location: opportunity.location,
      date: opportunity.date,
      startTime: opportunity.startTime,
      endTime: opportunity.endTime,
      timeCommitment: opportunity.timeCommitment,
      spotsNeeded: opportunity.spotsNeeded,
      status: opportunity.status,
      acceptedCount,
      remainingPositions: Math.max(opportunity.spotsNeeded - acceptedCount, 0),
      full: acceptedCount >= opportunity.spotsNeeded,
      participation: opportunity.assignments[0] ?? null,
    };
  });
}

export async function createWorkOpportunity(rawInput: unknown) {
  await requireAdmin();
  const validation = opportunityInputSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: validation.error.issues[0]?.message ?? "Enter valid opportunity details." };
  }

  try {
    await prisma.volunteerOpportunity.create({
      data: {
        ...toOpportunityData(validation.data),
        status: validation.data.publish ? "open" : "draft",
        spotsFilled: 0,
      },
      select: { id: true },
    });
    refreshOpportunityPages();
    return { success: true as const };
  } catch (error) {
    console.error("Work opportunity creation failed:", error);
    return { success: false as const, error: "Could not create this work opportunity." };
  }
}

export async function updateWorkOpportunity(rawInput: unknown) {
  await requireAdmin();
  const validation = opportunityUpdateSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: validation.error.issues[0]?.message ?? "Enter valid opportunity details." };
  }

  const { id, ...input } = validation.data;
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<{ id: string }[]>`
        SELECT "id"
        FROM "volunteer_opportunity"
        WHERE "id" = ${id}
        FOR UPDATE
      `;

      const opportunity = await tx.volunteerOpportunity.findUnique({
        where: { id },
        select: {
          id: true,
          spotsFilled: true,
          spotsNeeded: true,
          assignments: {
            where: { status: { in: [...participationStatuses] } },
            select: { id: true },
          },
        },
      });
      if (!opportunity) return "not_found" as const;

      const occupiedCount = getOccupiedCount(
        opportunity.spotsFilled,
        opportunity.assignments.length,
      );
      if (input.spotsNeeded < occupiedCount) return "capacity" as const;

      const opportunityData = toOpportunityData(input);
      await tx.volunteerOpportunity.update({
        where: { id },
        data: opportunityData,
      });
      await tx.volunteerAssignment.updateMany({
        where: {
          opportunityId: id,
          status: { in: ["accepted", "in_progress"] },
        },
        data: {
          title: input.title,
          description: input.description,
          location: input.location,
          deadline: new Date(`${input.date}T00:00:00.000Z`),
        },
      });
      return "updated" as const;
    });

    if (result === "not_found") return { success: false as const, error: "Work opportunity not found." };
    if (result === "capacity") {
      return { success: false as const, error: "Required volunteers cannot be fewer than the positions already accepted." };
    }
    refreshOpportunityPages();
    return { success: true as const };
  } catch (error) {
    console.error("Work opportunity update failed:", error);
    return { success: false as const, error: "Could not update this work opportunity." };
  }
}

export async function setWorkOpportunityStatus(rawId: unknown, rawStatus: unknown) {
  await requireAdmin();
  const idResult = z.string().trim().min(1).max(128).safeParse(rawId);
  const statusResult = z.enum(opportunityStatuses).safeParse(rawStatus);
  if (!idResult.success || !statusResult.success || statusResult.data === "draft") {
    return { success: false as const, error: "Choose a valid opportunity status." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<{ id: string }[]>`
        SELECT "id"
        FROM "volunteer_opportunity"
        WHERE "id" = ${idResult.data}
        FOR UPDATE
      `;

      const opportunity = await tx.volunteerOpportunity.findUnique({
        where: { id: idResult.data },
        select: {
          id: true,
          status: true,
          spotsFilled: true,
          spotsNeeded: true,
          assignments: {
            where: { status: { in: [...participationStatuses] } },
            select: { status: true },
          },
        },
      });
      if (!opportunity) return "not_found" as const;

      if (
        statusResult.data === "open" &&
        !["draft", "closed", "open"].includes(opportunity.status)
      ) {
        return "invalid_transition" as const;
      }
      if (
        statusResult.data === "closed" &&
        !["open", "closed"].includes(opportunity.status)
      ) {
        return "invalid_transition" as const;
      }
      if (
        statusResult.data === "completed" &&
        !["open", "closed"].includes(opportunity.status)
      ) {
        return "invalid_transition" as const;
      }
      if (
        statusResult.data === "cancelled" &&
        !["draft", "open", "closed", "cancelled"].includes(opportunity.status)
      ) {
        return "invalid_transition" as const;
      }
      if (
        statusResult.data === "open" &&
        getOccupiedCount(opportunity.spotsFilled, opportunity.assignments.length) >=
          opportunity.spotsNeeded
      ) {
        return "full" as const;
      }
      if (
        statusResult.data === "completed" &&
        opportunity.assignments.some((assignment) => assignment.status !== "completed")
      ) {
        return "incomplete" as const;
      }
      if (
        ["cancelled", "completed"].includes(opportunity.status) &&
        statusResult.data !== opportunity.status
      ) {
        return "invalid_transition" as const;
      }

      await tx.volunteerOpportunity.update({
        where: { id: opportunity.id },
        data: { status: statusResult.data },
      });
      return "updated" as const;
    });

    if (result === "not_found") return { success: false as const, error: "Work opportunity not found." };
    if (result === "invalid_transition") {
      return { success: false as const, error: "This opportunity cannot transition to that status." };
    }
    if (result === "full") {
      return { success: false as const, error: "A full opportunity cannot be reopened." };
    }
    if (result === "incomplete") {
      return { success: false as const, error: "All accepted volunteers must complete their work before the opportunity can be completed." };
    }
    refreshOpportunityPages();
    return { success: true as const };
  } catch (error) {
    console.error("Work opportunity status update failed:", error);
    return { success: false as const, error: "Could not update this opportunity status." };
  }
}

export async function acceptWorkOpportunity(rawOpportunityId: unknown) {
  const user = await requireApprovedVolunteer();
  const idResult = z.string().trim().min(1).max(128).safeParse(rawOpportunityId);
  if (!idResult.success) {
    return { success: false as const, error: "Invalid work opportunity." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<{ id: string }[]>`
        SELECT "id"
        FROM "volunteer_opportunity"
        WHERE "id" = ${idResult.data}
        FOR UPDATE
      `;

      const opportunity = await tx.volunteerOpportunity.findUnique({
        where: { id: idResult.data },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          date: true,
          spotsNeeded: true,
          spotsFilled: true,
          status: true,
        },
      });
      if (!opportunity || opportunity.status !== "open") return "closed" as const;

      const existing = await tx.volunteerAssignment.findUnique({
        where: {
          opportunityId_userId: {
            opportunityId: opportunity.id,
            userId: user.id,
          },
        },
        select: { id: true },
      });
      if (existing) return "duplicate" as const;

      const activeCount = await tx.volunteerAssignment.count({
        where: {
          opportunityId: opportunity.id,
          status: { in: [...participationStatuses] },
        },
      });
      const occupiedCount = getOccupiedCount(opportunity.spotsFilled, activeCount);
      if (occupiedCount >= opportunity.spotsNeeded) return "full" as const;

      await tx.volunteerAssignment.create({
        data: {
          userId: user.id,
          opportunityId: opportunity.id,
          title: opportunity.title,
          description: opportunity.description,
          location: opportunity.location,
          deadline: opportunity.date,
          status: "accepted",
        },
        select: { id: true },
      });
      await tx.volunteerOpportunity.update({
        where: { id: opportunity.id },
        data: { spotsFilled: occupiedCount + 1 },
      });
      return "accepted" as const;
    });

    if (result === "closed") return { success: false as const, error: "This opportunity is no longer open." };
    if (result === "duplicate") return { success: false as const, error: "You have already responded to this opportunity." };
    if (result === "full") return { success: false as const, error: "This opportunity has no remaining positions." };
    refreshOpportunityPages();
    return { success: true as const };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { success: false as const, error: "You have already responded to this opportunity." };
    }
    console.error("Work opportunity acceptance failed:", error);
    return { success: false as const, error: "Could not accept this opportunity." };
  }
}

export async function updateOpportunityParticipation(
  rawAssignmentId: unknown,
  rawStatus: unknown,
  rawNotes?: unknown,
) {
  const user = await requireApprovedVolunteer();
  const idResult = z.string().trim().min(1).max(128).safeParse(rawAssignmentId);
  const statusResult = z.enum(["in_progress", "completed", "declined"]).safeParse(rawStatus);
  const notesResult = z.string().trim().max(3000).optional().safeParse(rawNotes);
  if (!idResult.success || !statusResult.success || !notesResult.success) {
    return { success: false as const, error: "Invalid work status." };
  }

  const previousStatus = {
    in_progress: "accepted",
    completed: "in_progress",
    declined: "accepted",
  } as const;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.volunteerAssignment.findFirst({
        where: {
          id: idResult.data,
          userId: user.id,
          opportunityId: { not: null },
          status: previousStatus[statusResult.data],
        },
        select: { id: true, opportunityId: true },
      });
      if (!assignment?.opportunityId) return null;

      await tx.$queryRaw<{ id: string }[]>`
        SELECT "id"
        FROM "volunteer_opportunity"
        WHERE "id" = ${assignment.opportunityId}
        FOR UPDATE
      `;
      const updated = await tx.volunteerAssignment.updateMany({
        where: {
          id: assignment.id,
          userId: user.id,
          status: previousStatus[statusResult.data],
        },
        data: {
          status: statusResult.data,
          ...(statusResult.data === "completed"
            ? { volunteerNotes: notesResult.data ?? "" }
            : {}),
        },
      });
      if (updated.count !== 1) return null;

      if (statusResult.data === "declined") {
        const opportunity = await tx.volunteerOpportunity.findUnique({
          where: { id: assignment.opportunityId },
          select: {
            spotsFilled: true,
            assignments: {
              where: { status: { in: [...participationStatuses] } },
              select: { id: true },
            },
          },
        });
        if (opportunity) {
          await tx.volunteerOpportunity.update({
            where: { id: assignment.opportunityId },
            data: {
              spotsFilled: Math.max(
                opportunity.assignments.length,
                (opportunity.spotsFilled ?? 0) - 1,
              ),
            },
          });
        }
      }
      return assignment.opportunityId;
    });

    if (!result) {
      return {
        success: false as const,
        error: "This work can only be withdrawn while accepted, or advanced through the available status steps.",
      };
    }
    refreshOpportunityPages();
    revalidatePath(`/volunteer/assignments/${idResult.data}`);
    return { success: true as const, status: statusResult.data };
  } catch (error) {
    console.error("Work participation status update failed:", error);
    return { success: false as const, error: "Could not update this work status." };
  }
}
