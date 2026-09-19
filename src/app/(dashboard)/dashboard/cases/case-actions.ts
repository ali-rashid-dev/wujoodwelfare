"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/auth-server";
import {
  caseFormSchema,
  CaseFormInput,
  caseStatusEnum,
  casePriorityEnum,
  caseStatusUpdateSchema,
  CaseStatusUpdateInput,
  caseAssessmentSchema,
  CaseAssessmentInput,
  caseVisitSchema,
  CaseVisitInput,
  caseNoteSchema,
  CaseNoteInput,
  caseFollowUpSchema,
  CaseFollowUpInput,
} from "@/validation/case";
import { CaseStatus, CasePriority, Prisma } from "@prisma/client";

export async function createCase(data: CaseFormInput) {
  try {
    const session = await requireServerSession();
    const validated = caseFormSchema.parse(data);

    const year = new Date().getFullYear();
    const createdCase = await prisma.$transaction(async (tx) => {
      const [sequence] = await tx.$queryRaw<Array<{ nextValue: number }>>`
        INSERT INTO "case_code_sequence" ("year", "nextValue")
        VALUES (${year}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "nextValue" = "case_code_sequence"."nextValue" + 1
        RETURNING "nextValue"
      `;
      const caseNumber = `CASE-${year}-${String(Number(sequence.nextValue)).padStart(4, "0")}`;

      const newCase = await tx.beneficiaryCase.create({
        data: {
          caseNumber,
          beneficiaryId: validated.beneficiaryId,
          title: validated.title,
          category: validated.category || "GENERAL",
          priority: validated.priority as CasePriority,
          status: validated.assignedStaffId ? "ASSIGNED" : "NEW",
          description: validated.description || null,
          documents: validated.documents || [],
          openedAt: new Date(),
          isOpen: true,
        },
      });

      if (validated.assignedStaffId) {
        await tx.caseAssignment.create({
          data: {
            caseId: newCase.id,
            staffId: validated.assignedStaffId,
            roleInCase: "Primary Officer",
          },
        });
      }

      await tx.caseActivityLog.create({
        data: {
          caseId: newCase.id,
          toStatus: newCase.status,
          action: "Case Opened",
          details: `Opened case "${newCase.title}" for beneficiary.`,
          performedBy: session.user?.name || "Case Worker",
        },
      });

      return newCase;
    });

    revalidatePath("/dashboard/cases");
    return { success: true, id: createdCase.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to open case";
    return { success: false, error: message };
  }
}

export async function updateCase(id: string, data: CaseFormInput) {
  try {
    const session = await requireServerSession();
    const validated = caseFormSchema.parse(data);

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.beneficiaryCase.findUnique({ where: { id } });
      if (!existing) throw new Error("Case not found");

      const caseItem = await tx.beneficiaryCase.update({
        where: { id },
        data: {
          beneficiaryId: validated.beneficiaryId,
          title: validated.title,
          category: validated.category || "GENERAL",
          priority: validated.priority as CasePriority,
          description: validated.description || null,
          documents: validated.documents || [],
        },
      });

      if (validated.assignedStaffId) {
        const existingAssignment = await tx.caseAssignment.findFirst({
          where: { caseId: id, staffId: validated.assignedStaffId, roleInCase: "Primary Officer" },
        });
        await tx.caseAssignment.updateMany({
          where: {
            caseId: id,
            roleInCase: "Primary Officer",
            status: "ACTIVE",
            NOT: { staffId: validated.assignedStaffId },
          },
          data: { status: "INACTIVE" },
        });
        if (existingAssignment) {
          await tx.caseAssignment.update({
            where: { id: existingAssignment.id },
            data: { status: "ACTIVE" },
          });
        } else {
          await tx.caseAssignment.create({
            data: {
              caseId: id,
              staffId: validated.assignedStaffId,
              roleInCase: "Primary Officer",
            },
          });
        }
      } else {
        await tx.caseAssignment.updateMany({
          where: { caseId: id, roleInCase: "Primary Officer", status: "ACTIVE" },
          data: { status: "INACTIVE" },
        });
      }

      await tx.caseActivityLog.create({
        data: {
          caseId: id,
          toStatus: caseItem.status,
          action: "Case Details Updated",
          details: "Updated case title, priority, or category configuration.",
          performedBy: session.user?.name || "Case Worker",
        },
      });

      return caseItem;
    });

    revalidatePath("/dashboard/cases");
    revalidatePath(`/dashboard/cases/${id}`);
    return { success: true, caseItem: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update case";
    return { success: false, error: message };
  }
}

export async function updateCaseStatus(id: string, data: CaseStatusUpdateInput) {
  try {
    const session = await requireServerSession();
    const validated = caseStatusUpdateSchema.parse(data);

    const target = validated.targetStatus as CaseStatus;
    const isClosing = target === "CLOSED";
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "beneficiary_case" WHERE "id" = ${id} FOR UPDATE`;
      const existing = await tx.beneficiaryCase.findUnique({ where: { id } });
      if (!existing) throw new Error("Case not found");

      const allowedTransitions: Record<CaseStatus, CaseStatus[]> = {
        NEW: ["ASSIGNED", "UNDER_ASSESSMENT", "VERIFICATION", "DECISION", "ASSISTANCE", "FOLLOW_UP", "CLOSED"],
        ASSIGNED: ["UNDER_ASSESSMENT", "VERIFICATION", "DECISION", "ASSISTANCE", "FOLLOW_UP", "CLOSED"],
        UNDER_ASSESSMENT: ["VERIFICATION", "DECISION", "ASSISTANCE", "FOLLOW_UP", "CLOSED"],
        VERIFICATION: ["DECISION", "ASSISTANCE", "FOLLOW_UP", "CLOSED"],
        DECISION: ["ASSISTANCE", "FOLLOW_UP", "CLOSED"],
        ASSISTANCE: ["FOLLOW_UP", "CLOSED"],
        FOLLOW_UP: ["CLOSED"],
        CLOSED: [],
      };
      if (!allowedTransitions[existing.status].includes(target)) {
        throw new Error(`Invalid case status transition from ${existing.status} to ${target}`);
      }

      const updated = await tx.beneficiaryCase.update({
        where: { id },
        data: {
          status: target,
          isOpen: !isClosing,
          closedAt: isClosing ? now : existing.closedAt,
          closureReason: isClosing ? validated.closureReason || "Case resolved" : existing.closureReason,
        },
      });

      await tx.caseActivityLog.create({
        data: {
          caseId: id,
          fromStatus: existing.status,
          toStatus: target,
          action: isClosing ? "Case Closed" : `Status Advanced to ${target}`,
          details: validated.notes || (isClosing ? validated.closureReason : `Advanced status to ${target}`),
          performedBy: session.user?.name || "Case Worker",
        },
      });

      return updated;
    });

    revalidatePath("/dashboard/cases");
    revalidatePath(`/dashboard/cases/${id}`);
    return { success: true, caseItem: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update case status";
    return { success: false, error: message };
  }
}

export async function addCaseAssessment(caseId: string, data: CaseAssessmentInput) {
  try {
    const session = await requireServerSession();
    const validated = caseAssessmentSchema.parse(data);

    const result = await prisma.$transaction(async (tx) => {
      const assessment = await tx.caseAssessment.create({
        data: {
          caseId,
          assessorName: session.user?.name || "Case Worker",
          vulnerabilityScore: validated.vulnerabilityScore,
          financialNeedScore: validated.financialNeedScore,
          recommendation: validated.recommendation,
          findings: validated.findings || null,
        },
      });

      const existingCase = await tx.beneficiaryCase.findUnique({ where: { id: caseId } });
      let nextStatus = existingCase?.status;
      if (existingCase && (existingCase.status === "NEW" || existingCase.status === "ASSIGNED")) {
        nextStatus = "UNDER_ASSESSMENT";
        await tx.beneficiaryCase.update({
          where: { id: caseId },
          data: { status: "UNDER_ASSESSMENT" },
        });
      }

      await tx.caseActivityLog.create({
        data: {
          caseId,
          fromStatus: existingCase?.status,
          toStatus: nextStatus || "UNDER_ASSESSMENT",
          action: "Assessment Recorded",
          details: `Vulnerability Score: ${validated.vulnerabilityScore}/100. Financial Need Score: ${validated.financialNeedScore}/100.`,
          performedBy: session.user?.name || "Case Worker",
        },
      });

      return assessment;
    });

    revalidatePath(`/dashboard/cases/${caseId}`);
    return { success: true, assessment: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add assessment";
    return { success: false, error: message };
  }
}

export async function addCaseVisit(caseId: string, data: CaseVisitInput) {
  try {
    const session = await requireServerSession();
    const validated = caseVisitSchema.parse(data);

    const result = await prisma.$transaction(async (tx) => {
      const visit = await tx.caseVisit.create({
        data: {
          caseId,
          visitorName: session.user?.name || "Field Inspector",
          visitDate: new Date(validated.visitDate),
          location: validated.location || null,
          purpose: validated.purpose,
          findings: validated.findings,
          outcome: validated.outcome || null,
        },
      });

      const existingCase = await tx.beneficiaryCase.findUnique({ where: { id: caseId } });
      let nextStatus = existingCase?.status;
      if (existingCase && ["NEW", "ASSIGNED", "UNDER_ASSESSMENT"].includes(existingCase.status)) {
        nextStatus = "VERIFICATION";
        await tx.beneficiaryCase.update({
          where: { id: caseId },
          data: { status: "VERIFICATION" },
        });
      }

      await tx.caseActivityLog.create({
        data: {
          caseId,
          fromStatus: existingCase?.status,
          toStatus: nextStatus || "VERIFICATION",
          action: "Field Visit Recorded",
          details: `Field visit to ${validated.location || "beneficiary home"} for ${validated.purpose}.`,
          performedBy: session.user?.name || "Field Officer",
        },
      });

      return visit;
    });

    revalidatePath(`/dashboard/cases/${caseId}`);
    return { success: true, visit: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to log visit";
    return { success: false, error: message };
  }
}

export async function addCaseNote(caseId: string, data: CaseNoteInput) {
  try {
    const session = await requireServerSession();
    const validated = caseNoteSchema.parse(data);

    const note = await prisma.caseNote.create({
      data: {
        caseId,
        authorName: session.user?.name || "Case Officer",
        content: validated.content,
        isInternal: validated.isInternal,
      },
    });

    revalidatePath(`/dashboard/cases/${caseId}`);
    return { success: true, note };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add note";
    return { success: false, error: message };
  }
}

export async function scheduleCaseFollowUp(caseId: string, data: CaseFollowUpInput) {
  try {
    const session = await requireServerSession();
    const validated = caseFollowUpSchema.parse(data);

    const result = await prisma.$transaction(async (tx) => {
      const existingCase = await tx.beneficiaryCase.findUnique({ where: { id: caseId } });

      const updated = await tx.beneficiaryCase.update({
        where: { id: caseId },
        data: {
          nextFollowUpDate: new Date(validated.nextFollowUpDate),
          followUpPurpose: validated.followUpPurpose,
          status: existingCase?.isOpen && existingCase.status !== "CLOSED" ? "FOLLOW_UP" : existingCase?.status,
        },
      });

      await tx.caseActivityLog.create({
        data: {
          caseId,
          fromStatus: existingCase?.status,
          toStatus: updated.status,
          action: "Follow-up Scheduled",
          details: `Scheduled follow-up for ${new Date(validated.nextFollowUpDate).toLocaleDateString()}: ${validated.followUpPurpose}`,
          performedBy: session.user?.name || "Case Officer",
        },
      });

      return updated;
    });

    revalidatePath(`/dashboard/cases/${caseId}`);
    revalidatePath("/dashboard/cases");
    return { success: true, caseItem: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to schedule follow-up";
    return { success: false, error: message };
  }
}

export async function assignCaseStaff(caseId: string, staffId: string, roleInCase: string = "Primary Officer") {
  try {
    const session = await requireServerSession();
    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) return { success: false, error: "Staff member not found" };

    const assignment = await prisma.$transaction(async (tx) => {
      const existingAssignment = await tx.caseAssignment.findFirst({
        where: { caseId, staffId, roleInCase },
      });

      let created;
      if (roleInCase === "Primary Officer") {
        await tx.caseAssignment.updateMany({
          where: { caseId, roleInCase, status: "ACTIVE", NOT: { staffId } },
          data: { status: "INACTIVE" },
        });
      }
      if (existingAssignment) {
        created = await tx.caseAssignment.update({
          where: { id: existingAssignment.id },
          data: { status: "ACTIVE" },
        });
      } else {
        created = await tx.caseAssignment.create({
          data: {
            caseId,
            staffId,
            roleInCase,
          },
        });
      }

      const existingCase = await tx.beneficiaryCase.findUnique({ where: { id: caseId } });
      if (existingCase && existingCase.status === "NEW") {
        await tx.beneficiaryCase.update({
          where: { id: caseId },
          data: { status: "ASSIGNED" },
        });
      }

      await tx.caseActivityLog.create({
        data: {
          caseId,
          fromStatus: existingCase?.status,
          toStatus: existingCase?.status === "NEW" ? "ASSIGNED" : existingCase?.status || "ASSIGNED",
          action: "Officer Assigned",
          details: `Assigned ${staff.name} (${staff.designation}) as ${roleInCase}.`,
          performedBy: session.user?.name || "Admin",
        },
      });

      return created;
    });

    revalidatePath(`/dashboard/cases/${caseId}`);
    revalidatePath("/dashboard/cases");
    return { success: true, assignment };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign staff";
    return { success: false, error: message };
  }
}

export async function deleteCase(id: string) {
  try {
    await requireServerSession();
    await prisma.beneficiaryCase.delete({ where: { id } });
    revalidatePath("/dashboard/cases");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete case";
    return { success: false, error: message };
  }
}

export async function getCaseList(params?: {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requireServerSession();
    const requestedPage = Number(params?.page);
    const requestedLimit = Number(params?.limit);
    const page = Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.max(Math.floor(requestedPage), 1)
      : 1;
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), 100)
      : 12;
    const skip = (page - 1) * limit;

    const where: Prisma.BeneficiaryCaseWhereInput = {};

    if (params?.status && params.status !== "ALL") {
      const parsedStatus = caseStatusEnum.safeParse(params.status);
      if (parsedStatus.success) where.status = parsedStatus.data as CaseStatus;
    }
    if (params?.priority && params.priority !== "ALL") {
      const parsedPriority = casePriorityEnum.safeParse(params.priority);
      if (parsedPriority.success) where.priority = parsedPriority.data as CasePriority;
    }
    if (params?.category && params.category !== "ALL") {
      where.category = params.category;
    }
    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { caseNumber: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { beneficiary: { name: { contains: q, mode: "insensitive" } } },
        { beneficiary: { cnic: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.beneficiaryCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { openedAt: "desc" },
        include: {
          beneficiary: {
            select: { id: true, name: true, cnic: true, phone: true, status: true },
          },
          assignments: {
            include: {
              staff: { select: { id: true, name: true, designation: true } },
            },
          },
          _count: {
            select: { assessments: true, visits: true, notes: true },
          },
        },
      }),
      prisma.beneficiaryCase.count({ where }),
    ]);

    const formattedItems = items.map((c) => ({
      ...c,
      caseNumber: c.caseNumber || `CASE-${c.id.slice(-6).toUpperCase()}`,
      openedAt: c.openedAt.toISOString(),
      closedAt: c.closedAt ? c.closedAt.toISOString() : null,
      nextFollowUpDate: c.nextFollowUpDate ? c.nextFollowUpDate.toISOString() : null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
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

export async function getCaseById(id: string) {
  try {
    await requireServerSession();
    const caseItem = await prisma.beneficiaryCase.findUnique({
      where: { id },
      include: {
        beneficiary: {
          include: {
            family: true,
            economic: true,
            address: true,
          },
        },
        assignments: {
          include: {
            staff: { select: { id: true, name: true, designation: true, department: true } },
          },
        },
        assessments: {
          orderBy: { createdAt: "desc" },
        },
        visits: {
          orderBy: { visitDate: "desc" },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
        logs: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!caseItem) return null;

    return {
      ...caseItem,
      caseNumber: caseItem.caseNumber || `CASE-${caseItem.id.slice(-6).toUpperCase()}`,
      openedAt: caseItem.openedAt.toISOString(),
      closedAt: caseItem.closedAt ? caseItem.closedAt.toISOString() : null,
      nextFollowUpDate: caseItem.nextFollowUpDate ? caseItem.nextFollowUpDate.toISOString() : null,
      createdAt: caseItem.createdAt.toISOString(),
      updatedAt: caseItem.updatedAt.toISOString(),
      beneficiary: {
        ...caseItem.beneficiary,
        registeredAt: caseItem.beneficiary.registeredAt.toISOString(),
        economic: caseItem.beneficiary.economic
          ? {
              ...caseItem.beneficiary.economic,
              monthlyIncome: caseItem.beneficiary.economic.monthlyIncome
                ? caseItem.beneficiary.economic.monthlyIncome.toNumber()
                : null,
            }
          : null,
      },
      assignments: caseItem.assignments.map((a) => ({
        ...a,
        assignedAt: a.assignedAt.toISOString(),
      })),
      assessments: caseItem.assessments.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
      visits: caseItem.visits.map((v) => ({
        ...v,
        visitDate: v.visitDate.toISOString(),
        createdAt: v.createdAt.toISOString(),
      })),
      notes: caseItem.notes.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
      logs: caseItem.logs.map((l) => ({
        ...l,
        timestamp: l.timestamp.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

export async function getCaseStats() {
  try {
    await requireServerSession();
    const [
      total,
      active,
      urgentCount,
      pendingFollowUp,
      closed,
    ] = await Promise.all([
      prisma.beneficiaryCase.count(),
      prisma.beneficiaryCase.count({ where: { isOpen: true } }),
      prisma.beneficiaryCase.count({ where: { priority: "URGENT", isOpen: true } }),
      prisma.beneficiaryCase.count({ where: { nextFollowUpDate: { not: null }, isOpen: true } }),
      prisma.beneficiaryCase.count({ where: { isOpen: false } }),
    ]);

    return {
      total,
      active,
      urgentCount,
      pendingFollowUp,
      closed,
    };
  } catch {
    return {
      total: 0,
      active: 0,
      urgentCount: 0,
      pendingFollowUp: 0,
      closed: 0,
    };
  }
}

export async function getCaseOptions(selectedBeneficiaryId?: string) {
  try {
    await requireServerSession();
    const [beneficiaries, staff] = await Promise.all([
      prisma.beneficiary.findMany({
        orderBy: { name: "asc" },
        take: 100,
        select: { id: true, name: true, cnic: true, phone: true, status: true },
      }),
      prisma.staff.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, designation: true, department: true },
      }),
    ]);

    if (selectedBeneficiaryId && !beneficiaries.some((beneficiary) => beneficiary.id === selectedBeneficiaryId)) {
      const selectedBeneficiary = await prisma.beneficiary.findUnique({
        where: { id: selectedBeneficiaryId },
        select: { id: true, name: true, cnic: true, phone: true, status: true },
      });
      if (selectedBeneficiary) beneficiaries.push(selectedBeneficiary);
    }

    return { beneficiaries, staff };
  } catch {
    return { beneficiaries: [], staff: [] };
  }
}
