"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApprovedVolunteer } from "@/lib/volunteer-access";

const assignmentTransitionSchema = z.object({
  assignmentId: z.string().trim().min(1).max(128),
  status: z.enum(["accepted", "declined", "in_progress", "completed"]),
  notes: z.string().trim().max(3000, "Completion notes cannot exceed 3,000 characters.").optional(),
});

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  phone: z.string().trim().max(40, "Phone cannot exceed 40 characters."),
  city: z.string().trim().max(100, "City cannot exceed 100 characters."),
  skills: z.string().trim().max(1000, "Skills cannot exceed 1,000 characters."),
});

export type VolunteerProfileState = {
  success: boolean;
  message: string;
  fieldErrors: Partial<Record<"name" | "phone" | "city" | "skills", string>>;
};

export async function updateVolunteerAssignment(rawInput: unknown) {
  const user = await requireApprovedVolunteer();
  const validation = assignmentTransitionSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: "Invalid assignment update." };
  }

  const { assignmentId, status, notes } = validation.data;
  const allowedPreviousStatuses: Record<typeof status, string> = {
    accepted: "pending",
    declined: "pending",
    in_progress: "accepted",
    completed: "in_progress",
  };

  try {
    const result = await prisma.volunteerAssignment.updateMany({
      where: {
        id: assignmentId,
        userId: user.id,
        opportunityId: null,
        status: allowedPreviousStatuses[status],
      },
      data: {
        status,
        ...(status === "completed" ? { volunteerNotes: notes ?? "" } : {}),
      },
    });

    if (result.count !== 1) {
      return {
        success: false as const,
        error: "This assignment can no longer be changed from its current status.",
      };
    }
  } catch (error) {
    console.error("Volunteer assignment update failed:", error);
    return { success: false as const, error: "Could not update this assignment." };
  }

  revalidatePath("/volunteer");
  revalidatePath("/volunteer/dashboard");
  revalidatePath("/volunteer/assignments");
  revalidatePath(`/volunteer/assignments/${assignmentId}`);
  return { success: true as const, status };
}

export async function updateVolunteerProfile(
  _previousState: VolunteerProfileState,
  formData: FormData,
): Promise<VolunteerProfileState> {
  const user = await requireApprovedVolunteer();
  const validation = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    skills: formData.get("skills"),
  });

  if (!validation.success) {
    const fieldErrors: VolunteerProfileState["fieldErrors"] = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0];
      if (
        (field === "name" || field === "phone" || field === "city" || field === "skills") &&
        !fieldErrors[field]
      ) {
        fieldErrors[field] = issue.message;
      }
    }
    return { success: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  try {
    const updated = await prisma.volunteerApplication.updateMany({
      where: {
        id: user.volunteerApplication.id,
        status: "approved",
        OR: [
          { userId: user.id },
          ...(user.volunteerApplication.userId === null && user.emailVerified
            ? [{ userId: null, email: { equals: user.email, mode: "insensitive" as const } }]
            : []),
        ],
      },
      data: {
        ...validation.data,
        email: user.email,
        phone: validation.data.phone,
        city: validation.data.city,
        skills: validation.data.skills,
        userId: user.id,
      },
    });
    if (updated.count !== 1) {
      return {
        success: false,
        message: "Your approved volunteer profile could not be found.",
        fieldErrors: {},
      };
    }
  } catch (error) {
    console.error("Volunteer profile update failed:", error);
    return {
      success: false,
      message: "Could not save your profile. Please try again.",
      fieldErrors: {},
    };
  }

  revalidatePath("/volunteer/profile");
  revalidatePath("/volunteer/dashboard");
  revalidatePath("/admin/approved-volunteers");
  revalidatePath("/admin/volunteers");
  return { success: true, message: "Profile updated.", fieldErrors: {} };
}
