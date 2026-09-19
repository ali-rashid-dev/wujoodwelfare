"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/auth-server";
import {
  assistanceFormSchema,
  AssistanceFormInput,
  assistanceTypeEnum,
} from "@/validation/assistance";
import { AssistanceType, AssistanceStatus, DistributionMethod, Prisma } from "@prisma/client";

export async function recordAssistance(data: AssistanceFormInput) {
  try {
    const session = await requireServerSession();
    const validated = assistanceFormSchema.parse(data);

    const year = new Date().getFullYear();
    const createdRecord = await prisma.$transaction(async (tx) => {
      const [sequence] = await tx.$queryRaw<Array<{ nextValue: number }>>`
        INSERT INTO "assistance_code_sequence" ("year", "nextValue")
        VALUES (${year}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "nextValue" = "assistance_code_sequence"."nextValue" + 1
        RETURNING "nextValue"
      `;
      const assistanceCode = `AST-${year}-${String(Number(sequence.nextValue)).padStart(4, "0")}`;

      const newRecord = await tx.assistanceRecord.create({
        data: {
          assistanceCode,
          beneficiaryId: validated.beneficiaryId,
          caseId: validated.caseId || null,
          programId: validated.programId || null,
          type: validated.type as AssistanceType,
          description: validated.description || null,
          amount: validated.amount ? new Prisma.Decimal(validated.amount) : null,
          quantity: validated.quantity || null,
          status: validated.status as AssistanceStatus,
          distributionMethod: validated.distributionMethod as DistributionMethod,
          givenAt: validated.givenAt ? new Date(validated.givenAt) : new Date(),
          givenBy: validated.givenBy || session.user?.name || "Welfare Officer",
          notes: validated.notes || null,
        },
      });

      // Update program spent budget if linked
      if (validated.programId && validated.amount && validated.amount > 0) {
        await tx.welfareProgram.update({
          where: { id: validated.programId },
          data: {
            spentBudget: { increment: new Prisma.Decimal(validated.amount) },
          },
        });
      }

      // Update case status to ASSISTANCE if linked
      if (validated.caseId) {
        const caseItem = await tx.beneficiaryCase.findUnique({ where: { id: validated.caseId } });
        if (caseItem && caseItem.status !== "CLOSED") {
          await tx.beneficiaryCase.update({
            where: { id: validated.caseId },
            data: { status: "ASSISTANCE" },
          });
          await tx.caseActivityLog.create({
            data: {
              caseId: validated.caseId,
              fromStatus: caseItem.status,
              toStatus: "ASSISTANCE",
              action: "Assistance Provided",
              details: `Provided ${validated.type} assistance (${validated.amount ? `PKR ${validated.amount}` : validated.quantity || "Provided"}). Code: ${assistanceCode}`,
              performedBy: session.user?.name || "Welfare Officer",
            },
          });
        }
      }

      return newRecord;
    });

    revalidatePath("/dashboard/assistance");
    if (validated.caseId) revalidatePath(`/dashboard/cases/${validated.caseId}`);
    if (validated.beneficiaryId) revalidatePath(`/dashboard/beneficiaries/${validated.beneficiaryId}`);
    return { success: true, id: createdRecord.id, code: createdRecord.assistanceCode };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record assistance";
    return { success: false, error: message };
  }
}

export async function getAssistanceList(params?: {
  search?: string;
  type?: string;
  status?: string;
  beneficiaryId?: string;
  caseId?: string;
  programId?: string;
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

    const where: Prisma.AssistanceRecordWhereInput = {};

    if (params?.type && params.type !== "ALL") {
      const parsedType = assistanceTypeEnum.safeParse(params.type);
      if (parsedType.success) where.type = parsedType.data as AssistanceType;
    }

    if (params?.status && params.status !== "ALL") {
      where.status = params.status as AssistanceStatus;
    }

    if (params?.beneficiaryId) where.beneficiaryId = params.beneficiaryId;
    if (params?.caseId) where.caseId = params.caseId;
    if (params?.programId) where.programId = params.programId;

    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { assistanceCode: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { givenBy: { contains: q, mode: "insensitive" } },
        { beneficiary: { name: { contains: q, mode: "insensitive" } } },
        { beneficiary: { cnic: { contains: q, mode: "insensitive" } } },
        { caseItem: { caseNumber: { contains: q, mode: "insensitive" } } },
        { program: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.assistanceRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { givenAt: "desc" },
        include: {
          beneficiary: {
            select: { id: true, name: true, cnic: true, phone: true, status: true },
          },
          caseItem: {
            select: { id: true, caseNumber: true, title: true, status: true },
          },
          program: {
            select: { id: true, code: true, name: true },
          },
          distributions: {
            select: { id: true, distributionCode: true, status: true },
          },
        },
      }),
      prisma.assistanceRecord.count({ where }),
    ]);

    const formattedItems = items.map((ast) => ({
      ...ast,
      assistanceCode: ast.assistanceCode || `AST-${ast.id.slice(-6).toUpperCase()}`,
      amount: ast.amount ? ast.amount.toNumber() : null,
      givenAt: ast.givenAt.toISOString(),
      createdAt: ast.createdAt.toISOString(),
      updatedAt: ast.updatedAt.toISOString(),
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

export async function getAssistanceStats() {
  try {
    await requireServerSession();
    const [total, totalAmountResult, cashCount, foodCount, medicineCount, educationCount, clothingCount, equipmentCount, housingCount, emergencyCount] = await Promise.all([
      prisma.assistanceRecord.count(),
      prisma.assistanceRecord.aggregate({
        _sum: { amount: true },
      }),
      prisma.assistanceRecord.count({ where: { type: "CASH" } }),
      prisma.assistanceRecord.count({ where: { type: "FOOD" } }),
      prisma.assistanceRecord.count({ where: { type: "MEDICINE" } }),
      prisma.assistanceRecord.count({ where: { type: "EDUCATION" } }),
      prisma.assistanceRecord.count({ where: { type: "CLOTHING" } }),
      prisma.assistanceRecord.count({ where: { type: "EQUIPMENT" } }),
      prisma.assistanceRecord.count({ where: { type: "HOUSING" } }),
      prisma.assistanceRecord.count({ where: { type: "EMERGENCY_PACKAGE" } }),
    ]);

    return {
      total,
      totalValuePKR: totalAmountResult._sum.amount ? totalAmountResult._sum.amount.toNumber() : 0,
      breakdown: {
        CASH: cashCount,
        FOOD: foodCount,
        MEDICINE: medicineCount,
        EDUCATION: educationCount,
        CLOTHING: clothingCount,
        EQUIPMENT: equipmentCount,
        HOUSING: housingCount,
        EMERGENCY_PACKAGE: emergencyCount,
      },
    };
  } catch {
    return {
      total: 0,
      totalValuePKR: 0,
      breakdown: {
        CASH: 0,
        FOOD: 0,
        MEDICINE: 0,
        EDUCATION: 0,
        CLOTHING: 0,
        EQUIPMENT: 0,
        HOUSING: 0,
        EMERGENCY_PACKAGE: 0,
      },
    };
  }
}

export async function getAssistanceOptions() {
  try {
    await requireServerSession();
    const [beneficiaries, cases, programs, staff] = await Promise.all([
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
      prisma.welfareProgram.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: { id: true, code: true, name: true, assistanceType: true },
      }),
      prisma.staff.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, designation: true, department: true },
      }),
    ]);

    return { beneficiaries, cases, programs, staff };
  } catch {
    return { beneficiaries: [], cases: [], programs: [], staff: [] };
  }
}

export async function deleteAssistance(id: string) {
  try {
    await requireServerSession();
    await prisma.assistanceRecord.delete({ where: { id } });
    revalidatePath("/dashboard/assistance");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete assistance record";
    return { success: false, error: message };
  }
}
