"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession, requireAdmin } from "@/lib/auth-server";
import { volunteerApplicationSchema } from "@/validation";

export type VolunteerApplicationField =
  | "name"
  | "father_name"
  | "email"
  | "phone"
  | "city"
  | "qualification"
  | "gender"
  | "skills"
  | "availability"
  | "statement_of_purpose";

export type VolunteerApplicationState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<VolunteerApplicationField, string>>;
  fieldValues: Record<VolunteerApplicationField, string>;
};

const applicationFields: VolunteerApplicationField[] = [
  "name",
  "father_name",
  "email",
  "phone",
  "city",
  "qualification",
  "gender",
  "skills",
  "availability",
  "statement_of_purpose",
];

function getApplicationValues(formData: FormData) {
  return Object.fromEntries(
    applicationFields.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === "string" ? value : ""];
    }),
  ) as Record<VolunteerApplicationField, string>;
}

export async function submitVolunteerApplication(
  _previousState: VolunteerApplicationState,
  formData: FormData,
): Promise<VolunteerApplicationState> {
  const fieldValues = getApplicationValues(formData);
  const validation = volunteerApplicationSchema.safeParse(fieldValues);

  if (!validation.success) {
    const fieldErrors: Partial<Record<VolunteerApplicationField, string>> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0];
      if (
        typeof field === "string" &&
        applicationFields.includes(field as VolunteerApplicationField) &&
        !fieldErrors[field as VolunteerApplicationField]
      ) {
        fieldErrors[field as VolunteerApplicationField] = issue.message;
      }
    }

    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
      fieldValues,
    };
  }

  const email = validation.data.email.trim().toLowerCase();
  const session = await getServerSession();
  const linkedUserId =
    session?.user.emailVerified === true &&
    session.user.email?.toLowerCase() === email
      ? session.user.id
      : null;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const existingApplication = await tx.volunteerApplication.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
            status: { in: ["pending", "approved"] },
          },
          select: { status: true },
        });

        if (existingApplication) {
          return { duplicateStatus: existingApplication.status };
        }

        await tx.volunteerApplication.create({
          data: {
            userId: linkedUserId,
            name: validation.data.name.trim(),
            fatherName: validation.data.father_name.trim(),
            email,
            phone: validation.data.phone.trim(),
            city: validation.data.city.trim(),
            qualification: validation.data.qualification.trim(),
            gender: validation.data.gender,
            skills: validation.data.skills?.trim() ?? "",
            availability: validation.data.availability,
            statementOfPurpose: validation.data.statement_of_purpose.trim(),
          },
          select: { id: true },
        });

        return { duplicateStatus: null };
      },
      { isolationLevel: "Serializable" },
    );

    if (result.duplicateStatus) {
      return {
        status: "error",
        message:
          result.duplicateStatus === "approved"
            ? "An application for this email has already been approved. Sign in to access the volunteer portal."
            : "An application for this email is already under review.",
        fieldErrors: {},
        fieldValues,
      };
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2034"
    ) {
      try {
        const existingApplication = await prisma.volunteerApplication.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
            status: { in: ["pending", "approved"] },
          },
          select: { status: true },
        });

        if (existingApplication) {
          return {
            status: "error",
            message:
              existingApplication.status === "approved"
                ? "An application for this email has already been approved. Sign in to access the volunteer portal."
                : "An application for this email is already under review.",
            fieldErrors: {},
            fieldValues,
          };
        }
      } catch (lookupError) {
        console.error("Volunteer duplicate check after transaction conflict failed:", lookupError);
      }
    }

    console.error("Volunteer application submission failed:", error);
    return {
      status: "error",
      message: "We couldn't submit your application right now. Please try again later.",
      fieldErrors: {},
      fieldValues,
    };
  }

  revalidatePath("/admin/volunteers");
  revalidatePath("/volunteer/status");
  return {
    status: "success",
    message: "Thank you. Your volunteer application has been submitted for review.",
    fieldErrors: {},
    fieldValues,
  };
}

const applicationIdSchema = z.string().trim().min(1).max(128);
const assignmentSchema = z.object({
  userId: z.string().trim().min(1).max(128),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(5).max(3000),
  location: z.string().trim().max(160),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  deadline: z.string().trim().refine(
    (value) => value === "" || !Number.isNaN(Date.parse(value)),
    "Enter a valid deadline.",
  ).optional(),
});

export async function getAdminVolunteerManagement() {
  await requireAdmin();

  const applications = await prisma.volunteerApplication.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      name: true,
      fatherName: true,
      email: true,
      phone: true,
      city: true,
      qualification: true,
      gender: true,
      skills: true,
      availability: true,
      statementOfPurpose: true,
      status: true,
      createdAt: true,
    },
  });

  const approvedEmails = [
    ...new Set(
      applications
        .filter((application) => application.status === "approved")
        .map((application) => application.email),
    ),
  ];

  const users = approvedEmails.length
    ? await prisma.user.findMany({
        where: {
          email: { in: approvedEmails, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          city: true,
          skills: true,
          banned: true,
          assignments: {
            orderBy: { createdAt: "desc" },
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
          },
        },
      })
    : [];

  const volunteers = applications
    .filter((application) => application.status === "approved")
    .map((application) => ({
      application,
      account:
        users.find(
          (user) =>
            user.id === application.userId ||
            user.email.toLowerCase() === application.email.toLowerCase(),
        ) ?? null,
    }));

  return { applications, volunteers };
}

export async function updateVolunteerApplicationStatus(
  rawId: unknown,
  rawStatus: unknown,
) {
  await requireAdmin();
  const idResult = applicationIdSchema.safeParse(rawId);
  const statusResult = z.enum(["approved", "rejected"]).safeParse(rawStatus);
  if (!idResult.success || !statusResult.success) {
    return { success: false as const, error: "Invalid application or status." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.volunteerApplication.findUnique({
        where: { id: idResult.data },
        select: {
          id: true,
          userId: true,
          email: true,
          name: true,
          phone: true,
          city: true,
          skills: true,
          status: true,
        },
      });

      if (!application || application.status !== "pending") {
        return { updated: false, userId: null };
      }

      const user = await tx.user.findFirst({
        where: {
          emailVerified: true,
          OR: [
            ...(application.userId ? [{ id: application.userId }] : []),
            { email: { equals: application.email, mode: "insensitive" } },
          ],
        },
        select: { id: true, role: true },
      });

      const updated = await tx.volunteerApplication.updateMany({
        where: { id: application.id, status: "pending" },
        data: {
          status: statusResult.data,
          userId: user?.id ?? null,
        },
      });

      if (updated.count !== 1) return { updated: false, userId: null };

      if (user && user.role !== "admin" && statusResult.data === "approved") {
        await tx.user.update({
          where: { id: user.id },
          data: {
            role: "volunteer",
            name: application.name,
            phone: application.phone,
            city: application.city,
            skills: application.skills,
          },
        });
      }

      return { updated: true, userId: user?.id ?? null };
    });

    if (!result.updated) {
      return {
        success: false as const,
        error: "This application has already been reviewed or no longer exists.",
      };
    }

    revalidatePath("/admin/volunteers");
    revalidatePath("/volunteer/dashboard");
    revalidatePath("/volunteer/status");
    return {
      success: true as const,
      status: statusResult.data,
      userId: result.userId,
    };
  } catch (error) {
    console.error("Volunteer application review failed:", error);
    return { success: false as const, error: "Could not update this application." };
  }
}

export async function createVolunteerAssignment(
  rawInput: unknown,
) {
  await requireAdmin();
  const validation = assignmentSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: "Please provide valid assignment details." };
  }

  const volunteer = await prisma.user.findFirst({
    where: {
      id: validation.data.userId,
      role: "volunteer",
      OR: [{ banned: false }, { banned: null }],
    },
    select: { id: true, email: true },
  });

  const approvedApplication = volunteer
    ? await prisma.volunteerApplication.findFirst({
        where: {
          status: "approved",
          OR: [
            { userId: volunteer.id },
            { email: { equals: volunteer.email, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      })
    : null;

  if (!volunteer || !approvedApplication) {
    return {
      success: false as const,
      error: "Assignments can only be given to active, approved volunteers.",
    };
  }

  try {
    await prisma.volunteerAssignment.create({
      data: {
        userId: volunteer.id,
        title: validation.data.title,
        description: validation.data.description,
        location: validation.data.location || null,
        priority: validation.data.priority,
        deadline: validation.data.deadline ? new Date(validation.data.deadline) : null,
        status: "pending",
      },
      select: { id: true },
    });
  } catch (error) {
    console.error("Volunteer assignment creation failed:", error);
    return { success: false as const, error: "Could not create this assignment." };
  }

  revalidatePath("/admin/volunteers");
  revalidatePath("/volunteer/dashboard");
  return { success: true as const };
}
