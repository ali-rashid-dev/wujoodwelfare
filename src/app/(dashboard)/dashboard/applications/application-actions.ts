"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/auth-server";
import {
  applicationFormSchema,
  ApplicationFormInput,
  applicationStatusUpdateSchema,
  ApplicationStatusUpdateInput,
} from "@/validation/application";
import { ApplicationStatus, ApplicationPriority, AssistanceType, Prisma } from "@prisma/client";

export async function createApplication(data: ApplicationFormInput) {
  try {
    const session = await requireServerSession();
    const validated = applicationFormSchema.parse(data);

    const year = new Date().getFullYear();
    const application = await prisma.$transaction(async (tx) => {
      const [sequence] = await tx.$queryRaw<Array<{ nextValue: number }>>`
        INSERT INTO "application_code_sequence" ("year", "nextValue")
        VALUES (${year}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "nextValue" = "application_code_sequence"."nextValue" + 1
        RETURNING "nextValue"
      `;
      const applicationCode = `APP-${year}-${String(Number(sequence.nextValue)).padStart(4, "0")}`;

      const created = await tx.welfareApplication.create({
        data: {
          applicationCode,
          beneficiaryId: validated.beneficiaryId,
          programId: validated.programId || null,
          assistanceType: validated.assistanceType as AssistanceType,
          requestedAmount: validated.requestedAmount ? new Prisma.Decimal(validated.requestedAmount) : null,
          requestedItems: validated.requestedItems || null,
          reason: validated.reason,
          priority: validated.priority as ApplicationPriority,
          status: "SUBMITTED",
          documents: validated.documents || [],
          submittedAt: new Date(),
        },
      });

      await tx.applicationLog.create({
        data: {
          applicationId: created.id,
          toStatus: "SUBMITTED",
          notes: "Application submitted for intake review.",
          performedBy: session.user?.name || "System Intake",
        },
      });

      return created;
    });

    revalidatePath("/dashboard/applications");
    return { success: true, id: application.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create application";
    return { success: false, error: message };
  }
}

export async function updateApplication(id: string, data: ApplicationFormInput) {
  try {
    const session = await requireServerSession();
    const validated = applicationFormSchema.parse(data);

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.welfareApplication.update({
        where: { id },
        data: {
          beneficiaryId: validated.beneficiaryId,
          programId: validated.programId || null,
          assistanceType: validated.assistanceType as AssistanceType,
          requestedAmount: validated.requestedAmount ? new Prisma.Decimal(validated.requestedAmount) : null,
          requestedItems: validated.requestedItems || null,
          reason: validated.reason,
          priority: validated.priority as ApplicationPriority,
          documents: validated.documents || [],
        },
      });

      await tx.applicationLog.create({
        data: {
          applicationId: id,
          toStatus: app.status,
          notes: "Application details updated.",
          performedBy: session.user?.name || "Staff Member",
        },
      });

      return app;
    });

    revalidatePath("/dashboard/applications");
    revalidatePath(`/dashboard/applications/${id}`);
    return { success: true, application: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update application";
    return { success: false, error: message };
  }
}

export async function updateApplicationStatus(id: string, data: ApplicationStatusUpdateInput) {
  try {
    const session = await requireServerSession();
    const validated = applicationStatusUpdateSchema.parse(data);
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "welfare_application" WHERE "id" = ${id} FOR UPDATE`;
      const existing = await tx.welfareApplication.findUnique({
        where: { id },
        include: { beneficiary: true, program: true },
      });

      if (!existing) throw new Error("Application not found");

      const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
        SUBMITTED: ["INITIAL_REVIEW", "REJECTED"],
        INITIAL_REVIEW: ["VERIFICATION", "REJECTED"],
        VERIFICATION: ["ELIGIBILITY_ASSESSMENT", "REJECTED"],
        ELIGIBILITY_ASSESSMENT: ["APPROVED", "REJECTED"],
        APPROVED: [],
        REJECTED: [],
      };
      const targetStatus = validated.targetStatus as ApplicationStatus;
      if (!allowedTransitions[existing.status].includes(targetStatus)) {
        throw new Error(`Invalid application status transition from ${existing.status} to ${targetStatus}`);
      }

      const now = new Date();
      const statusData: Prisma.WelfareApplicationUpdateInput = {
        status: targetStatus,
        reviewNotes: validated.notes || existing.reviewNotes,
      };

      if (targetStatus === "INITIAL_REVIEW" && !existing.reviewedAt) {
        statusData.reviewedAt = now;
      } else if (targetStatus === "VERIFICATION" && !existing.verifiedAt) {
        statusData.verifiedAt = now;
      } else if (targetStatus === "ELIGIBILITY_ASSESSMENT" && !existing.assessedAt) {
        statusData.assessedAt = now;
      } else if (targetStatus === "APPROVED" || targetStatus === "REJECTED") {
        statusData.decidedAt = now;
        if (targetStatus === "REJECTED") {
          statusData.rejectionReason = validated.rejectionReason || "Criteria requirements not met.";
        }
      }

      const updatedApp = await tx.welfareApplication.update({
        where: { id },
        data: statusData,
      });

      await tx.applicationLog.create({
        data: {
          applicationId: id,
          fromStatus: existing.status,
          toStatus: targetStatus,
          notes: validated.notes || (targetStatus === "REJECTED" ? validated.rejectionReason : `Status updated to ${targetStatus}`),
          performedBy: session.user?.name || "Staff Officer",
        },
      });

      // Auto-enroll beneficiary into program if APPROVED
      if (targetStatus === "APPROVED" && existing.programId) {
        await tx.programEnrollment.upsert({
          where: {
            programId_beneficiaryId: {
              programId: existing.programId,
              beneficiaryId: existing.beneficiaryId,
            },
          },
          create: {
            programId: existing.programId,
            beneficiaryId: existing.beneficiaryId,
            status: "ENROLLED",
            approvedAt: now,
            notes: `Enrolled automatically via approved application ${existing.applicationCode}`,
          },
          update: {
            status: "ENROLLED",
            approvedAt: now,
          },
        });
      }

      return { application: updatedApp, programId: existing.programId };
    });

    revalidatePath("/dashboard/applications");
    revalidatePath(`/dashboard/applications/${id}`);
    if (result.programId) {
      revalidatePath(`/dashboard/programs/${result.programId}`);
    }
    return { success: true, application: result.application };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update application status";
    return { success: false, error: message };
  }
}

export async function assignApplicationReviewer(id: string, reviewerId: string) {
  try {
    const session = await requireServerSession();
    const reviewer = await prisma.staff.findUnique({ where: { id: reviewerId } });
    if (!reviewer) {
      return { success: false, error: "Reviewer staff profile not found" };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.welfareApplication.update({
        where: { id },
        data: { reviewerId },
      });

      await tx.applicationLog.create({
        data: {
          applicationId: id,
          toStatus: app.status,
          notes: `Assigned reviewer: ${reviewer.name} (${reviewer.designation})`,
          performedBy: session.user?.name || "Admin",
        },
      });

      return app;
    });

    revalidatePath(`/dashboard/applications/${id}`);
    revalidatePath("/dashboard/applications");
    return { success: true, application: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign reviewer";
    return { success: false, error: message };
  }
}

export async function deleteApplication(id: string) {
  try {
    await requireServerSession();
    await prisma.welfareApplication.delete({ where: { id } });
    revalidatePath("/dashboard/applications");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete application";
    return { success: false, error: message };
  }
}

export async function getApplicationList(params?: {
  search?: string;
  status?: string;
  priority?: string;
  programId?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requireServerSession();
    const page = Math.max(params?.page || 1, 1);
    const limit = Math.min(params?.limit || 12, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.WelfareApplicationWhereInput = {};

    if (params?.status && params.status !== "ALL") {
      where.status = params.status as ApplicationStatus;
    }
    if (params?.priority && params.priority !== "ALL") {
      where.priority = params.priority as ApplicationPriority;
    }
    if (params?.programId && params.programId !== "ALL") {
      where.programId = params.programId;
    }
    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { applicationCode: { contains: q, mode: "insensitive" } },
        { reason: { contains: q, mode: "insensitive" } },
        { requestedItems: { contains: q, mode: "insensitive" } },
        { beneficiary: { name: { contains: q, mode: "insensitive" } } },
        { beneficiary: { cnic: { contains: q, mode: "insensitive" } } },
        { program: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.welfareApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          beneficiary: {
            select: { id: true, name: true, cnic: true, phone: true, status: true },
          },
          program: {
            select: { id: true, name: true, code: true, assistanceType: true },
          },
          reviewer: {
            select: { id: true, name: true, designation: true },
          },
        },
      }),
      prisma.welfareApplication.count({ where }),
    ]);

    const formattedItems = items.map((app) => ({
      ...app,
      requestedAmount: app.requestedAmount ? app.requestedAmount.toNumber() : null,
      submittedAt: app.submittedAt.toISOString(),
      reviewedAt: app.reviewedAt ? app.reviewedAt.toISOString() : null,
      verifiedAt: app.verifiedAt ? app.verifiedAt.toISOString() : null,
      assessedAt: app.assessedAt ? app.assessedAt.toISOString() : null,
      decidedAt: app.decidedAt ? app.decidedAt.toISOString() : null,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));

    return {
      items: formattedItems,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 1 };
  }
}

export async function getApplicationById(id: string) {
  try {
    await requireServerSession();
    const app = await prisma.welfareApplication.findUnique({
      where: { id },
      include: {
        beneficiary: {
          select: {
            id: true,
            name: true,
            cnic: true,
            phone: true,
            email: true,
            status: true,
            registeredAt: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            code: true,
            assistanceType: true,
            requiredDocuments: true,
            eligibilityCriteria: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
            department: true,
          },
        },
        logs: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!app) return null;

    return {
      ...app,
      requestedAmount: app.requestedAmount ? app.requestedAmount.toNumber() : null,
      submittedAt: app.submittedAt.toISOString(),
      reviewedAt: app.reviewedAt ? app.reviewedAt.toISOString() : null,
      verifiedAt: app.verifiedAt ? app.verifiedAt.toISOString() : null,
      assessedAt: app.assessedAt ? app.assessedAt.toISOString() : null,
      decidedAt: app.decidedAt ? app.decidedAt.toISOString() : null,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      beneficiary: {
        ...app.beneficiary,
        registeredAt: app.beneficiary.registeredAt.toISOString(),
      },
      logs: app.logs.map((l) => ({
        ...l,
        timestamp: l.timestamp.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

export async function getApplicationStats() {
  try {
    await requireServerSession();
    const [
      total,
      submitted,
      initialReview,
      verification,
      eligibilityAssessment,
      approved,
      rejected,
      urgentCount,
    ] = await Promise.all([
      prisma.welfareApplication.count(),
      prisma.welfareApplication.count({ where: { status: "SUBMITTED" } }),
      prisma.welfareApplication.count({ where: { status: "INITIAL_REVIEW" } }),
      prisma.welfareApplication.count({ where: { status: "VERIFICATION" } }),
      prisma.welfareApplication.count({ where: { status: "ELIGIBILITY_ASSESSMENT" } }),
      prisma.welfareApplication.count({ where: { status: "APPROVED" } }),
      prisma.welfareApplication.count({ where: { status: "REJECTED" } }),
      prisma.welfareApplication.count({ where: { priority: "URGENT", status: { notIn: ["APPROVED", "REJECTED"] } } }),
    ]);

    return {
      total,
      submitted,
      initialReview,
      verification,
      eligibilityAssessment,
      approved,
      rejected,
      pending: submitted + initialReview + verification + eligibilityAssessment,
      urgentCount,
    };
  } catch {
    return {
      total: 0,
      submitted: 0,
      initialReview: 0,
      verification: 0,
      eligibilityAssessment: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      urgentCount: 0,
    };
  }
}

export async function getAvailableBeneficiariesAndPrograms() {
  try {
    await requireServerSession();
    const [beneficiaries, programs, staff] = await Promise.all([
      prisma.beneficiary.findMany({
        orderBy: { name: "asc" },
        take: 100,
        select: { id: true, name: true, cnic: true, phone: true, status: true },
      }),
      prisma.welfareProgram.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, code: true, assistanceType: true, requiredDocuments: true },
      }),
      prisma.staff.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, designation: true, department: true },
      }),
    ]);

    return { beneficiaries, programs, staff };
  } catch {
    return { beneficiaries: [], programs: [], staff: [] };
  }
}
