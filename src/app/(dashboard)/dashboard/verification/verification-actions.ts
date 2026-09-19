"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/auth-server";
import {
  verificationFormSchema,
  VerificationFormInput,
  identityVerificationSchema,
  IdentityVerificationInput,
  documentVerificationSchema,
  DocumentVerificationInput,
  householdVerificationSchema,
  HouseholdVerificationInput,
  incomeAssessmentSchema,
  IncomeAssessmentInput,
  fieldVerificationSchema,
  FieldVerificationInput,
  eligibilityChecklistSchema,
  EligibilityChecklistInput,
  verificationDecisionSchema,
  VerificationDecisionInput,
} from "@/validation/verification";
import { VerificationStatus, VerificationCheckStatus, Prisma } from "@prisma/client";

export async function createVerificationRecord(data: VerificationFormInput) {
  try {
    const session = await requireServerSession();
    const validated = verificationFormSchema.parse(data);

    if (!validated.beneficiaryId && !validated.applicationId && !validated.caseId) {
      return { success: false, error: "Must specify a Beneficiary, Application, or Case to verify." };
    }

    const year = new Date().getFullYear();
    const createdRecord = await prisma.$transaction(async (tx) => {
      const [sequence] = await tx.$queryRaw<Array<{ nextValue: number }>>`
        INSERT INTO "verification_code_sequence" ("year", "nextValue")
        VALUES (${year}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "nextValue" = "verification_code_sequence"."nextValue" + 1
        RETURNING "nextValue"
      `;
      const verificationCode = `VERIF-${year}-${String(Number(sequence.nextValue)).padStart(4, "0")}`;

      // If application or case provided, extract beneficiaryId if not explicitly given
      let beneficiaryId = validated.beneficiaryId || null;
      if (!beneficiaryId && validated.applicationId) {
        const app = await tx.welfareApplication.findUnique({ where: { id: validated.applicationId } });
        if (app) beneficiaryId = app.beneficiaryId;
      }
      if (!beneficiaryId && validated.caseId) {
        const caseItem = await tx.beneficiaryCase.findUnique({ where: { id: validated.caseId } });
        if (caseItem) beneficiaryId = caseItem.beneficiaryId;
      }

      const record = await tx.verificationRecord.create({
        data: {
          verificationCode,
          beneficiaryId: beneficiaryId || undefined,
          applicationId: validated.applicationId || undefined,
          caseId: validated.caseId || undefined,
          verifierName: session.user?.name || validated.verifierName || "Verification Officer",
          status: "IN_PROGRESS",
          identityStatus: "PENDING",
          documentStatus: "PENDING",
          householdStatus: "PENDING",
          incomeStatus: "PENDING",
          fieldStatus: "PENDING",
        },
      });

      await tx.verificationLog.create({
        data: {
          verificationId: record.id,
          action: "Verification Initiated",
          toStatus: "IN_PROGRESS",
          performedBy: session.user?.name || "Verification Officer",
          notes: validated.notes || `Verification initiated under code ${verificationCode}`,
        },
      });

      // Also update linked case status to VERIFICATION if applicable
      if (validated.caseId) {
        await tx.beneficiaryCase.update({
          where: { id: validated.caseId },
          data: { status: "VERIFICATION" },
        });
      }

      return record;
    });

    revalidatePath("/dashboard/verification");
    if (validated.caseId) revalidatePath(`/dashboard/cases/${validated.caseId}`);
    return { success: true, id: createdRecord.id, code: createdRecord.verificationCode };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to initiate verification";
    return { success: false, error: message };
  }
}

export async function updateIdentityCheck(id: string, data: IdentityVerificationInput) {
  try {
    const session = await requireServerSession();
    const validated = identityVerificationSchema.parse(data);

    const record = await prisma.$transaction(async (tx) => {
      const updated = await tx.verificationRecord.update({
        where: { id },
        data: {
          identityStatus: validated.identityStatus as VerificationCheckStatus,
          cnicVerified: validated.cnicVerified,
          bformVerified: validated.bformVerified,
          biometricStatus: validated.biometricStatus,
          nadraRefNo: validated.nadraRefNo || null,
          identityNotes: validated.identityNotes || null,
        },
      });

      await tx.verificationLog.create({
        data: {
          verificationId: id,
          action: "Identity Verification Updated",
          performedBy: session.user?.name || "Verification Officer",
          notes: `Status: ${validated.identityStatus}. CNIC Verified: ${validated.cnicVerified}. Biometric: ${validated.biometricStatus}`,
        },
      });

      return updated;
    });

    revalidatePath(`/dashboard/verification/${id}`);
    return { success: true, record };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update identity verification";
    return { success: false, error: message };
  }
}

export async function updateDocumentCheck(id: string, data: DocumentVerificationInput) {
  try {
    const session = await requireServerSession();
    const validated = documentVerificationSchema.parse(data);

    const record = await prisma.$transaction(async (tx) => {
      const updated = await tx.verificationRecord.update({
        where: { id },
        data: {
          documentStatus: validated.documentStatus as VerificationCheckStatus,
          docAuthenticityChecked: validated.docAuthenticityChecked,
          missingDocuments: validated.missingDocuments,
          documentNotes: validated.documentNotes || null,
        },
      });

      await tx.verificationLog.create({
        data: {
          verificationId: id,
          action: "Document Verification Updated",
          performedBy: session.user?.name || "Verification Officer",
          notes: `Status: ${validated.documentStatus}. Authenticity Checked: ${validated.docAuthenticityChecked}. Missing docs: ${validated.missingDocuments.length}`,
        },
      });

      return updated;
    });

    revalidatePath(`/dashboard/verification/${id}`);
    return { success: true, record };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update document verification";
    return { success: false, error: message };
  }
}

export async function updateHouseholdCheck(id: string, data: HouseholdVerificationInput) {
  try {
    const session = await requireServerSession();
    const validated = householdVerificationSchema.parse(data);

    const record = await prisma.$transaction(async (tx) => {
      const updated = await tx.verificationRecord.update({
        where: { id },
        data: {
          householdStatus: validated.householdStatus as VerificationCheckStatus,
          verifiedFamilySize: validated.verifiedFamilySize,
          verifiedDependents: validated.verifiedDependents,
          verifiedHousingCondition: validated.verifiedHousingCondition || null,
          assetAuditSummary: validated.assetAuditSummary || null,
          householdNotes: validated.householdNotes || null,
        },
      });

      await tx.verificationLog.create({
        data: {
          verificationId: id,
          action: "Household Verification Updated",
          performedBy: session.user?.name || "Verification Officer",
          notes: `Status: ${validated.householdStatus}. Verified Family Size: ${validated.verifiedFamilySize}, Dependents: ${validated.verifiedDependents}`,
        },
      });

      return updated;
    });

    revalidatePath(`/dashboard/verification/${id}`);
    return { success: true, record };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update household verification";
    return { success: false, error: message };
  }
}

export async function updateIncomeAssessment(id: string, data: IncomeAssessmentInput) {
  try {
    const session = await requireServerSession();
    const validated = incomeAssessmentSchema.parse(data);

    const isEligible = validated.verifiedIncome <= validated.incomeThreshold;

    const record = await prisma.$transaction(async (tx) => {
      const updated = await tx.verificationRecord.update({
        where: { id },
        data: {
          incomeStatus: validated.incomeStatus as VerificationCheckStatus,
          declaredIncome: validated.declaredIncome,
          verifiedIncome: validated.verifiedIncome,
          incomeThreshold: validated.incomeThreshold,
          isEligibleIncome: isEligible,
          povertyScoreIndex: validated.povertyScoreIndex,
          incomeNotes: validated.incomeNotes || null,
        },
      });

      await tx.verificationLog.create({
        data: {
          verificationId: id,
          action: "Income & Poverty Score Assessed",
          performedBy: session.user?.name || "Financial Assessor",
          notes: `Verified Income: PKR ${validated.verifiedIncome}. Threshold: PKR ${validated.incomeThreshold}. Poverty Index: ${validated.povertyScoreIndex}/100. Eligible: ${isEligible ? "Yes" : "No"}`,
        },
      });

      return updated;
    });

    revalidatePath(`/dashboard/verification/${id}`);
    return { success: true, record };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update income assessment";
    return { success: false, error: message };
  }
}

export async function updateFieldVerification(id: string, data: FieldVerificationInput) {
  try {
    const session = await requireServerSession();
    const validated = fieldVerificationSchema.parse(data);

    const record = await prisma.$transaction(async (tx) => {
      const updated = await tx.verificationRecord.update({
        where: { id },
        data: {
          fieldStatus: validated.fieldStatus as VerificationCheckStatus,
          fieldOfficerId: validated.fieldOfficerId || null,
          fieldOfficerName: validated.fieldOfficerName || session.user?.name || "Field Inspector",
          fieldVisitDate: validated.fieldVisitDate ? new Date(validated.fieldVisitDate) : new Date(),
          neighborCheckPassed: validated.neighborCheckPassed,
          physicalAddressVerified: validated.physicalAddressVerified,
          fieldNotes: validated.fieldNotes || null,
        },
      });

      await tx.verificationLog.create({
        data: {
          verificationId: id,
          action: "Field Inspection Recorded",
          performedBy: session.user?.name || "Field Inspector",
          notes: `Field Status: ${validated.fieldStatus}. Physical Address: ${validated.physicalAddressVerified ? "Verified" : "Unverified"}. Neighbor Check: ${validated.neighborCheckPassed ? "Passed" : "Failed"}`,
        },
      });

      return updated;
    });

    revalidatePath(`/dashboard/verification/${id}`);
    return { success: true, record };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record field verification";
    return { success: false, error: message };
  }
}

export async function submitEligibilityChecklist(id: string, data: EligibilityChecklistInput) {
  try {
    const session = await requireServerSession();
    const validated = eligibilityChecklistSchema.parse(data);

    const record = await prisma.$transaction(async (tx) => {
      const updated = await tx.verificationRecord.update({
        where: { id },
        data: {
          checklistData: validated.checklistData as unknown as Prisma.InputJsonValue,
          overallScore: validated.overallScore,
        },
      });

      await tx.verificationLog.create({
        data: {
          verificationId: id,
          action: "Eligibility Checklist Submitted",
          performedBy: session.user?.name || "Verification Officer",
          notes: `Checklist completed with calculated overall score of ${validated.overallScore}/100.`,
        },
      });

      return updated;
    });

    revalidatePath(`/dashboard/verification/${id}`);
    return { success: true, record };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit checklist";
    return { success: false, error: message };
  }
}

export async function decideVerification(id: string, data: VerificationDecisionInput) {
  try {
    const session = await requireServerSession();
    const validated = verificationDecisionSchema.parse(data);

    const targetStatus = validated.targetStatus as VerificationStatus;
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.verificationRecord.findUnique({
        where: { id },
        include: { beneficiary: true, caseItem: true, application: true },
      });

      if (!existing) throw new Error("Verification record not found");

      const updated = await tx.verificationRecord.update({
        where: { id },
        data: {
          status: targetStatus,
          overallScore: validated.overallScore,
          decisionReason: validated.decisionReason,
          decidedAt: now,
          decidedBy: session.user?.name || "Senior Verifier",
        },
      });

      await tx.verificationLog.create({
        data: {
          verificationId: id,
          fromStatus: existing.status,
          toStatus: targetStatus,
          action: `Decision Rendered: ${targetStatus}`,
          performedBy: session.user?.name || "Senior Verifier",
          notes: `Reason: ${validated.decisionReason} | Final Score: ${validated.overallScore}/100`,
        },
      });

      // Automatic Status Propagation to connected Beneficiary, Case, or Application
      if (existing.beneficiaryId) {
        if (targetStatus === "VERIFIED") {
          await tx.beneficiary.update({
            where: { id: existing.beneficiaryId },
            data: { status: "VERIFIED", verifiedAt: now },
          });
        } else if (targetStatus === "REJECTED" || targetStatus === "FLAGGED_FRAUD") {
          await tx.beneficiary.update({
            where: { id: existing.beneficiaryId },
            data: { status: "REJECTED" },
          });
        }
      }

      if (existing.caseId) {
        if (targetStatus === "VERIFIED") {
          await tx.beneficiaryCase.update({
            where: { id: existing.caseId },
            data: { status: "DECISION" },
          });
          await tx.caseActivityLog.create({
            data: {
              caseId: existing.caseId,
              fromStatus: existing.caseItem?.status,
              toStatus: "DECISION",
              action: "Verification Completed & Passed",
              details: `Verification approved under code ${existing.verificationCode}. Ready for decision/assistance.`,
              performedBy: session.user?.name || "Verification Officer",
            },
          });
        } else if (targetStatus === "REJECTED" || targetStatus === "FLAGGED_FRAUD") {
          await tx.beneficiaryCase.update({
            where: { id: existing.caseId },
            data: { status: "CLOSED", isOpen: false, closedAt: now, closureReason: `Verification Failed: ${validated.decisionReason}` },
          });
          await tx.caseActivityLog.create({
            data: {
              caseId: existing.caseId,
              fromStatus: existing.caseItem?.status,
              toStatus: "CLOSED",
              action: "Case Closed - Verification Failed",
              details: `Closed case due to verification outcome: ${targetStatus}. Reason: ${validated.decisionReason}`,
              performedBy: session.user?.name || "Verification Officer",
            },
          });
        }
      }

      if (existing.applicationId) {
        if (targetStatus === "VERIFIED") {
          await tx.welfareApplication.update({
            where: { id: existing.applicationId },
            data: { status: "ELIGIBILITY_ASSESSMENT", verifiedAt: now },
          });
        } else if (targetStatus === "REJECTED" || targetStatus === "FLAGGED_FRAUD") {
          await tx.welfareApplication.update({
            where: { id: existing.applicationId },
            data: { status: "REJECTED", rejectionReason: validated.decisionReason, decidedAt: now },
          });
        }
      }

      return updated;
    });

    revalidatePath("/dashboard/verification");
    revalidatePath(`/dashboard/verification/${id}`);
    if (result.caseId) revalidatePath(`/dashboard/cases/${result.caseId}`);
    return { success: true, record: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record decision";
    return { success: false, error: message };
  }
}

export async function checkDuplicateCNIC(cnic?: string | null) {
  try {
    await requireServerSession();
    if (!cnic || cnic.trim() === "") return { isDuplicate: false, count: 0, details: [] };

    const formattedCnic = cnic.trim();

    const [existingBeneficiaries, existingCases, existingApps] = await Promise.all([
      prisma.beneficiary.findMany({
        where: { cnic: formattedCnic },
        select: { id: true, name: true, cnic: true, status: true, registeredAt: true },
      }),
      prisma.beneficiaryCase.findMany({
        where: { beneficiary: { cnic: formattedCnic } },
        select: { id: true, caseNumber: true, title: true, status: true, isOpen: true },
      }),
      prisma.welfareApplication.findMany({
        where: { beneficiary: { cnic: formattedCnic } },
        select: { id: true, applicationCode: true, status: true, submittedAt: true },
      }),
    ]);

    const isDuplicate = existingBeneficiaries.length > 1 || existingCases.length > 0 || existingApps.length > 0;

    return {
      isDuplicate,
      beneficiaries: existingBeneficiaries.map((b) => ({ ...b, registeredAt: b.registeredAt.toISOString() })),
      activeCases: existingCases,
      applications: existingApps.map((a) => ({ ...a, submittedAt: a.submittedAt.toISOString() })),
      summary: `Found ${existingBeneficiaries.length} beneficiary records, ${existingCases.length} cases, and ${existingApps.length} applications matching CNIC ${formattedCnic}.`,
    };
  } catch {
    return { isDuplicate: false, count: 0, details: [] };
  }
}

export async function getVerificationList(params?: {
  search?: string;
  status?: string;
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

    const where: Prisma.VerificationRecordWhereInput = {};

    if (params?.status && params.status !== "ALL") {
      where.status = params.status as VerificationStatus;
    }

    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { verificationCode: { contains: q, mode: "insensitive" } },
        { verifierName: { contains: q, mode: "insensitive" } },
        { beneficiary: { name: { contains: q, mode: "insensitive" } } },
        { beneficiary: { cnic: { contains: q, mode: "insensitive" } } },
        { caseItem: { caseNumber: { contains: q, mode: "insensitive" } } },
        { application: { applicationCode: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.verificationRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          beneficiary: {
            select: { id: true, name: true, cnic: true, phone: true, status: true },
          },
          caseItem: {
            select: { id: true, caseNumber: true, title: true, status: true },
          },
          application: {
            select: { id: true, applicationCode: true, assistanceType: true, status: true },
          },
          _count: {
            select: { logs: true },
          },
        },
      }),
      prisma.verificationRecord.count({ where }),
    ]);

    const formattedItems = items.map((rec) => ({
      ...rec,
      declaredIncome: rec.declaredIncome ? rec.declaredIncome.toNumber() : null,
      verifiedIncome: rec.verifiedIncome ? rec.verifiedIncome.toNumber() : null,
      incomeThreshold: rec.incomeThreshold ? rec.incomeThreshold.toNumber() : 45000,
      fieldVisitDate: rec.fieldVisitDate ? rec.fieldVisitDate.toISOString() : null,
      decidedAt: rec.decidedAt ? rec.decidedAt.toISOString() : null,
      createdAt: rec.createdAt.toISOString(),
      updatedAt: rec.updatedAt.toISOString(),
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

export async function getVerificationById(id: string) {
  try {
    await requireServerSession();
    const record = await prisma.verificationRecord.findUnique({
      where: { id },
      include: {
        beneficiary: {
          include: {
            address: true,
            family: true,
            economic: true,
            documents: true,
          },
        },
        caseItem: {
          include: {
            assessments: true,
            visits: true,
          },
        },
        application: true,
        logs: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!record) return null;

    let duplicateInfo = null;
    if (record.beneficiary?.cnic) {
      duplicateInfo = await checkDuplicateCNIC(record.beneficiary.cnic);
    }

    return {
      ...record,
      declaredIncome: record.declaredIncome ? record.declaredIncome.toNumber() : null,
      verifiedIncome: record.verifiedIncome ? record.verifiedIncome.toNumber() : null,
      incomeThreshold: record.incomeThreshold ? record.incomeThreshold.toNumber() : 45000,
      fieldVisitDate: record.fieldVisitDate ? record.fieldVisitDate.toISOString() : null,
      decidedAt: record.decidedAt ? record.decidedAt.toISOString() : null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      beneficiary: record.beneficiary
        ? {
            ...record.beneficiary,
            registeredAt: record.beneficiary.registeredAt.toISOString(),
            economic: record.beneficiary.economic
              ? {
                  ...record.beneficiary.economic,
                  monthlyIncome: record.beneficiary.economic.monthlyIncome
                    ? record.beneficiary.economic.monthlyIncome.toNumber()
                    : null,
                }
              : null,
          }
        : null,
      logs: record.logs.map((l) => ({
        ...l,
        timestamp: l.timestamp.toISOString(),
      })),
      duplicateInfo,
    };
  } catch {
    return null;
  }
}

export async function getVerificationStats() {
  try {
    await requireServerSession();
    const [total, pending, inProgress, verified, rejected, flaggedFraud] = await Promise.all([
      prisma.verificationRecord.count(),
      prisma.verificationRecord.count({ where: { status: "PENDING" } }),
      prisma.verificationRecord.count({ where: { status: "IN_PROGRESS" } }),
      prisma.verificationRecord.count({ where: { status: "VERIFIED" } }),
      prisma.verificationRecord.count({ where: { status: "REJECTED" } }),
      prisma.verificationRecord.count({ where: { status: "FLAGGED_FRAUD" } }),
    ]);

    const avgScoreResult = await prisma.verificationRecord.aggregate({
      _avg: { overallScore: true },
      where: { status: "VERIFIED" },
    });

    return {
      total,
      pending,
      inProgress,
      verified,
      rejected,
      flaggedFraud,
      averageScore: Math.round(avgScoreResult._avg.overallScore || 0),
    };
  } catch {
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      verified: 0,
      rejected: 0,
      flaggedFraud: 0,
      averageScore: 0,
    };
  }
}

export async function getVerificationOptions() {
  try {
    await requireServerSession();
    const [beneficiaries, cases, applications, staff] = await Promise.all([
      prisma.beneficiary.findMany({
        orderBy: { name: "asc" },
        take: 100,
        select: { id: true, name: true, cnic: true, phone: true, status: true },
      }),
      prisma.beneficiaryCase.findMany({
        where: { isOpen: true },
        orderBy: { openedAt: "desc" },
        take: 100,
        select: { id: true, caseNumber: true, title: true, beneficiary: { select: { name: true, cnic: true } } },
      }),
      prisma.welfareApplication.findMany({
        where: { status: { in: ["SUBMITTED", "INITIAL_REVIEW", "VERIFICATION"] } },
        orderBy: { submittedAt: "desc" },
        take: 100,
        select: { id: true, applicationCode: true, assistanceType: true, beneficiary: { select: { name: true, cnic: true } } },
      }),
      prisma.staff.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, designation: true, department: true },
      }),
    ]);

    return { beneficiaries, cases, applications, staff };
  } catch {
    return { beneficiaries: [], cases: [], applications: [], staff: [] };
  }
}
