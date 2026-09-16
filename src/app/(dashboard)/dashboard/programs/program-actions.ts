"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/auth-server";
import {
  programFormSchema,
  ProgramFormInput,
  programEnrollmentSchema,
  ProgramEnrollmentInput,
  programAidDisbursementSchema,
  ProgramAidDisbursementInput,
} from "@/validation/program";
import { ProgramStatus, AssistanceType, DocumentType, Prisma } from "@prisma/client";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProgram(data: ProgramFormInput) {
  try {
    await requireServerSession();
    const validated = programFormSchema.parse(data);

    let slug = generateSlug(validated.name);
    const existingSlug = await prisma.welfareProgram.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const year = new Date().getFullYear();
    const program = await prisma.$transaction(async (tx) => {
      const [sequence] = await tx.$queryRaw<Array<{ nextValue: number }>>`
        INSERT INTO "program_code_sequence" ("year", "nextValue")
        VALUES (${year}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "nextValue" = "program_code_sequence"."nextValue" + 1
        RETURNING "nextValue"
      `;
      const code = `PROG-${year}-${String(Number(sequence.nextValue)).padStart(4, "0")}`;

      const created = await tx.welfareProgram.create({
        data: {
          code,
          name: validated.name,
          slug,
          description: validated.description || null,
          eligibilityCriteria: validated.eligibilityCriteria || null,
          budget: new Prisma.Decimal(validated.budget || 0),
          spentBudget: new Prisma.Decimal(0),
          startDate: new Date(validated.startDate),
          endDate: validated.endDate ? new Date(validated.endDate) : null,
          status: validated.status as ProgramStatus,
          assistanceType: validated.assistanceType as AssistanceType,
          requiredDocuments: validated.requiredDocuments as DocumentType[],
          targetBeneficiaries: validated.targetBeneficiaries || null,
          maxBeneficiaries: validated.maxBeneficiaries || null,
        },
      });

      return created;
    });

    revalidatePath("/dashboard/programs");
    return { success: true, id: program.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create welfare program";
    return { success: false, error: message };
  }
}

export async function updateProgram(id: string, data: ProgramFormInput) {
  try {
    await requireServerSession();
    const validated = programFormSchema.parse(data);

    const existing = await prisma.welfareProgram.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Program not found" };
    }

    let slug = existing.slug;
    if (existing.name !== validated.name) {
      slug = generateSlug(validated.name);
      const otherWithSlug = await prisma.welfareProgram.findFirst({
        where: { slug, NOT: { id } },
      });
      if (otherWithSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updated = await prisma.welfareProgram.update({
      where: { id },
      data: {
        name: validated.name,
        slug,
        description: validated.description || null,
        eligibilityCriteria: validated.eligibilityCriteria || null,
        budget: new Prisma.Decimal(validated.budget || 0),
        startDate: new Date(validated.startDate),
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        status: validated.status as ProgramStatus,
        assistanceType: validated.assistanceType as AssistanceType,
        requiredDocuments: validated.requiredDocuments as DocumentType[],
        targetBeneficiaries: validated.targetBeneficiaries || null,
        maxBeneficiaries: validated.maxBeneficiaries || null,
      },
    });

    revalidatePath("/dashboard/programs");
    revalidatePath(`/dashboard/programs/${id}`);
    return { success: true, program: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update welfare program";
    return { success: false, error: message };
  }
}

export async function deleteProgram(id: string) {
  try {
    await requireServerSession();
    await prisma.welfareProgram.delete({ where: { id } });
    revalidatePath("/dashboard/programs");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete welfare program";
    return { success: false, error: message };
  }
}

export async function getProgramList(params?: {
  search?: string;
  status?: string;
  assistanceType?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requireServerSession();
    const page = Math.max(params?.page || 1, 1);
    const limit = Math.min(params?.limit || 12, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.WelfareProgramWhereInput = {};

    if (params?.status && params.status !== "ALL") {
      where.status = params.status as ProgramStatus;
    }
    if (params?.assistanceType && params.assistanceType !== "ALL") {
      where.assistanceType = params.assistanceType as AssistanceType;
    }
    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { eligibilityCriteria: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.welfareProgram.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { enrollments: true, disbursements: true },
          },
        },
      }),
      prisma.welfareProgram.count({ where }),
    ]);

    const formattedItems = items.map((p) => ({
      ...p,
      budget: p.budget.toNumber(),
      spentBudget: p.spentBudget.toNumber(),
      startDate: p.startDate.toISOString(),
      endDate: p.endDate ? p.endDate.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
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

export async function getProgramById(id: string) {
  try {
    await requireServerSession();
    const program = await prisma.welfareProgram.findUnique({
      where: { id },
      include: {
        enrollments: {
          orderBy: { enrolledAt: "desc" },
          include: {
            beneficiary: {
              select: {
                id: true,
                name: true,
                cnic: true,
                phone: true,
                status: true,
              },
            },
          },
        },
        disbursements: {
          orderBy: { givenAt: "desc" },
          take: 100,
          include: {
            beneficiary: {
              select: {
                id: true,
                name: true,
                cnic: true,
              },
            },
          },
        },
      },
    });

    if (!program) return null;

    return {
      ...program,
      budget: program.budget.toNumber(),
      spentBudget: program.spentBudget.toNumber(),
      startDate: program.startDate.toISOString(),
      endDate: program.endDate ? program.endDate.toISOString() : null,
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
      enrollments: program.enrollments.map((e) => ({
        ...e,
        enrolledAt: e.enrolledAt.toISOString(),
        approvedAt: e.approvedAt ? e.approvedAt.toISOString() : null,
      })),
      disbursements: program.disbursements.map((d) => ({
        ...d,
        amount: d.amount ? d.amount.toNumber() : 0,
        givenAt: d.givenAt.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

export async function getProgramStats() {
  try {
    await requireServerSession();
    const [totalPrograms, activePrograms, aggregations, totalEnrollments] = await Promise.all([
      prisma.welfareProgram.count(),
      prisma.welfareProgram.count({ where: { status: "ACTIVE" } }),
      prisma.welfareProgram.aggregate({
        _sum: {
          budget: true,
          spentBudget: true,
        },
      }),
      prisma.programEnrollment.count(),
    ]);

    const totalBudget = aggregations._sum.budget ? aggregations._sum.budget.toNumber() : 0;
    const totalSpent = aggregations._sum.spentBudget ? aggregations._sum.spentBudget.toNumber() : 0;

    return {
      totalPrograms,
      activePrograms,
      totalBudget,
      totalSpent,
      totalEnrollments,
    };
  } catch {
    return {
      totalPrograms: 0,
      activePrograms: 0,
      totalBudget: 0,
      totalSpent: 0,
      totalEnrollments: 0,
    };
  }
}

export async function seedDefaultPrograms() {
  try {
    await requireServerSession();
    const existingCount = await prisma.welfareProgram.count();
    if (existingCount > 0) {
      return { success: false, error: "Programs already exist in database." };
    }

    const defaultPrograms: Array<{
      name: string;
      description: string;
      eligibilityCriteria: string;
      budget: number;
      assistanceType: AssistanceType;
      requiredDocuments: DocumentType[];
      targetBeneficiaries: number;
    }> = [
      {
        name: "Food Assistance Program",
        description: "Provides monthly dry ration packages, flour, oil, and nutrition kits to underprivileged families.",
        eligibilityCriteria: "Household monthly income below PKR 35,000, widow-headed families, or disabled breadwinners.",
        budget: 5000000,
        assistanceType: "FOOD",
        requiredDocuments: ["CNIC", "PROOF_OF_INCOME", "PROOF_OF_RESIDENCE"],
        targetBeneficiaries: 500,
      },
      {
        name: "Medical Assistance & Emergency Care",
        description: "Covers diagnostic tests, prescription drugs, emergency surgical support, and hospital stay costs.",
        eligibilityCriteria: "Patients requiring urgent medical intervention without health insurance or adequate income.",
        budget: 7500000,
        assistanceType: "MEDICAL",
        requiredDocuments: ["CNIC", "MEDICAL_REPORT", "PROOF_OF_INCOME"],
        targetBeneficiaries: 300,
      },
      {
        name: "Education Support & Literacy Program",
        description: "Sponsors school tuition fees, uniforms, textbooks, stationery, and higher education stipends.",
        eligibilityCriteria: "School and college students with minimum 60% academic grade from low-income households.",
        budget: 4000000,
        assistanceType: "EDUCATION",
        requiredDocuments: ["B_FORM", "ACADEMIC_RECORD", "PROOF_OF_INCOME"],
        targetBeneficiaries: 400,
      },
      {
        name: "Orphan Care & Support Program",
        description: "Dedicated monthly stipend, education sponsorship, and healthcare package for orphaned children.",
        eligibilityCriteria: "Children under 18 who have lost one or both parents, living with guardian or single mother.",
        budget: 6000000,
        assistanceType: "ORPHAN_SUPPORT",
        requiredDocuments: ["B_FORM", "ORPHAN_CERTIFICATE", "CNIC"],
        targetBeneficiaries: 250,
      },
      {
        name: "Disability Support & Rehab Aid",
        description: "Provides customized wheelchairs, hearing aids, prosthetic limbs, and disability monthly stipends.",
        eligibilityCriteria: "Individuals with certified physical or mental disabilities needing assistive equipment.",
        budget: 3500000,
        assistanceType: "DISABILITY_SUPPORT",
        requiredDocuments: ["CNIC", "DISABILITY_CERTIFICATE", "MEDICAL_REPORT"],
        targetBeneficiaries: 200,
      },
      {
        name: "Emergency Relief & Disaster Response",
        description: "Rapid deployment of emergency food supplies, clean water, blankets, tents, and cash aid in crises.",
        eligibilityCriteria: "Victims of natural disasters, urban flooding, fires, or sudden emergency crises.",
        budget: 8000000,
        assistanceType: "EMERGENCY_RELIEF",
        requiredDocuments: ["CNIC", "PROOF_OF_RESIDENCE"],
        targetBeneficiaries: 1000,
      },
      {
        name: "Housing Support & Shelter Repair",
        description: "Assists with house rent arrears, roof leak repairs, basic sanitation, and emergency winter shelter.",
        eligibilityCriteria: "Families living in dilapidated/unsafe structures or facing imminent rental eviction.",
        budget: 4500000,
        assistanceType: "HOUSING",
        requiredDocuments: ["CNIC", "PROOF_OF_RESIDENCE", "PROOF_OF_INCOME"],
        targetBeneficiaries: 150,
      },
      {
        name: "Marriage Assistance Program",
        description: "Financial grant and essential dowry/household item packages (Jahez) for deserving brides.",
        eligibilityCriteria: "Orphan brides, daughters of widows, or low-income families planning imminent marriage.",
        budget: 5000000,
        assistanceType: "MARRIAGE_ASSISTANCE",
        requiredDocuments: ["CNIC", "MARRIAGE_CERTIFICATE", "PROOF_OF_INCOME"],
        targetBeneficiaries: 200,
      },
      {
        name: "Employment Support & Micro-Grants",
        description: "Provides small business startup kits (sewing machines, rickshaws, cart stalls) and vocational tools.",
        eligibilityCriteria: "Unemployed individuals or youth with marketable skill ready to start self-employment.",
        budget: 6500000,
        assistanceType: "EMPLOYMENT_SUPPORT",
        requiredDocuments: ["CNIC", "JOB_APPLICATION", "PROOF_OF_RESIDENCE"],
        targetBeneficiaries: 180,
      },
      {
        name: "Monthly Financial Aid (Kafalat)",
        description: "Direct monthly cash stipend disbursemnt for destitute elders, widows, and helpless families.",
        eligibilityCriteria: "Elderly citizens with no income source, widows with dependents, or vulnerable households.",
        budget: 10000000,
        assistanceType: "MONTHLY_FINANCIAL_AID",
        requiredDocuments: ["CNIC", "PROOF_OF_INCOME", "PROOF_OF_RESIDENCE"],
        targetBeneficiaries: 600,
      },
    ];

    const year = new Date().getFullYear();
    let createdCount = 0;

    for (let i = 0; i < defaultPrograms.length; i++) {
      const p = defaultPrograms[i];
      const slug = generateSlug(p.name);
      const code = `PROG-${year}-${String(i + 1).padStart(4, "0")}`;

      await prisma.welfareProgram.create({
        data: {
          code,
          name: p.name,
          slug,
          description: p.description,
          eligibilityCriteria: p.eligibilityCriteria,
          budget: new Prisma.Decimal(p.budget),
          spentBudget: new Prisma.Decimal(0),
          startDate: new Date(),
          status: "ACTIVE",
          assistanceType: p.assistanceType,
          requiredDocuments: p.requiredDocuments,
          targetBeneficiaries: p.targetBeneficiaries,
        },
      });
      createdCount++;
    }

    // Ensure sequence table is initialized
    await prisma.$executeRaw`
      INSERT INTO "program_code_sequence" ("year", "nextValue")
      VALUES (${year}, ${createdCount})
      ON CONFLICT ("year") DO UPDATE
      SET "nextValue" = EXCLUDED."nextValue"
    `;

    revalidatePath("/dashboard/programs");
    return { success: true, count: createdCount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to seed default programs";
    return { success: false, error: message };
  }
}

export async function enrollBeneficiaryToProgram(data: ProgramEnrollmentInput) {
  try {
    await requireServerSession();
    const validated = programEnrollmentSchema.parse(data);

    const existing = await prisma.programEnrollment.findUnique({
      where: {
        programId_beneficiaryId: {
          programId: validated.programId,
          beneficiaryId: validated.beneficiaryId,
        },
      },
    });

    if (existing) {
      return { success: false, error: "Beneficiary is already enrolled in this program." };
    }

    const enrollment = await prisma.programEnrollment.create({
      data: {
        programId: validated.programId,
        beneficiaryId: validated.beneficiaryId,
        notes: validated.notes || null,
        approvedAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/programs/${validated.programId}`);
    return { success: true, enrollment };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to enroll beneficiary";
    return { success: false, error: message };
  }
}

export async function removeBeneficiaryFromProgram(enrollmentId: string, programId: string) {
  try {
    await requireServerSession();
    await prisma.programEnrollment.delete({
      where: { id: enrollmentId },
    });

    revalidatePath(`/dashboard/programs/${programId}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to remove enrollment";
    return { success: false, error: message };
  }
}

export async function disburseProgramAid(data: ProgramAidDisbursementInput) {
  try {
    const session = await requireServerSession();
    const validated = programAidDisbursementSchema.parse(data);

    const program = await prisma.welfareProgram.findUnique({
      where: { id: validated.programId },
    });

    if (!program) {
      return { success: false, error: "Program not found" };
    }

    const disbursement = await prisma.$transaction(async (tx) => {
      const record = await tx.assistanceRecord.create({
        data: {
          beneficiaryId: validated.beneficiaryId,
          programId: validated.programId,
          type: program.assistanceType,
          description: validated.description || `Aid disbursed via ${program.name}`,
          amount: new Prisma.Decimal(validated.amount || 0),
          quantity: validated.quantity || null,
          givenBy: session.user?.name || "Staff Officer",
        },
      });

      await tx.welfareProgram.update({
        where: { id: validated.programId },
        data: {
          spentBudget: {
            increment: new Prisma.Decimal(validated.amount || 0),
          },
        },
      });

      return record;
    });

    revalidatePath(`/dashboard/programs/${validated.programId}`);
    return { success: true, disbursement };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to disburse aid";
    return { success: false, error: message };
  }
}

export async function getAvailableBeneficiariesForProgram(params?: { search?: string; page?: number; limit?: number }) {
  try {
    await requireServerSession();
    const page = Math.max(params?.page || 1, 1);
    const limit = Math.min(params?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.BeneficiaryWhereInput = {};
    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { cnic: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ];
    }

    const items = await prisma.beneficiary.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        cnic: true,
        phone: true,
        status: true,
      },
    });

    return { items };
  } catch {
    return { items: [] };
  }
}
