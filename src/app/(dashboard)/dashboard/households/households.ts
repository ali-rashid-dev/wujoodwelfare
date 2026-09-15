"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/auth-server";
import {
  householdFormSchema,
  HouseholdFormInput,
  householdMemberSchema,
  HouseholdMemberInput,
  householdDocumentSchema,
  HouseholdDocumentInput,
} from "@/validation/household";

export interface WelfareAssessment {
  score: number;
  category: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  perCapitaIncome: number;
  dependentsRatio: number;
  reasons: string[];
  recommendation: string;
}

export async function calculateWelfareAssessment(params: {
  monthlyIncome: number;
  totalMembers: number;
  dependents: number;
  disabledCount: number;
  elderlyCount: number;
  childrenCount: number;
  housingType?: string | null;
  housingCondition?: string | null;
}): Promise<WelfareAssessment> {
  const {
    monthlyIncome,
    totalMembers,
    dependents,
    disabledCount,
    elderlyCount,
    housingType,
    housingCondition,
  } = params;

  const validMembers = Math.max(totalMembers, 1);
  const perCapitaIncome = Math.round(monthlyIncome / validMembers);
  const dependentsRatio = Math.round((dependents / validMembers) * 100);

  let score = 0;
  const reasons: string[] = [];

  // 1. Income per capita check
  if (perCapitaIncome < 5000) {
    score += 40;
    reasons.push("Extreme income poverty (under PKR 5,000/person)");
  } else if (perCapitaIncome < 10000) {
    score += 25;
    reasons.push("Low per capita income (under PKR 10,000/person)");
  } else if (perCapitaIncome < 20000) {
    score += 15;
    reasons.push("Below average income (under PKR 20,000/person)");
  } else {
    score += 5;
  }

  // 2. High Dependents ratio
  if (dependentsRatio >= 70) {
    score += 20;
    reasons.push(`High dependent burden (${dependentsRatio}% of family dependent)`);
  } else if (dependentsRatio >= 50) {
    score += 12;
    reasons.push(`Moderate dependent burden (${dependentsRatio}% of family dependent)`);
  }

  // 3. Disabled family members
  if (disabledCount > 0) {
    const pts = Math.min(disabledCount * 15, 30);
    score += pts;
    reasons.push(`${disabledCount} disabled family member(s) needing medical care`);
  }

  // 4. Elderly members
  if (elderlyCount > 0) {
    const pts = Math.min(elderlyCount * 10, 20);
    score += pts;
    reasons.push(`${elderlyCount} elderly dependent(s) in household`);
  }

  // 5. Housing condition
  if (housingType === "HOMELESS" || housingCondition?.toLowerCase().includes("katcha") || housingCondition?.toLowerCase().includes("dilapidated")) {
    score += 15;
    reasons.push("Unstable or damaged housing shelter");
  } else if (housingType === "RENTED" || housingType === "SHARED") {
    score += 10;
    reasons.push(`Housing burden (${housingType.toLowerCase()} accommodation)`);
  }

  const finalScore = Math.min(Math.max(score, 0), 100);

  let category: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" = "MODERATE";
  let recommendation = "";

  if (finalScore >= 70) {
    category = "CRITICAL";
    recommendation = "Immediate emergency monthly ration, cash grant, and medical assistance recommended.";
  } else if (finalScore >= 45) {
    category = "HIGH";
    recommendation = "High priority for food packs, educational stipends, and housing support.";
  } else if (finalScore >= 25) {
    category = "MODERATE";
    recommendation = "Eligible for seasonal relief (Ramadan ration, Qurbani meat, winter clothing).";
  } else {
    category = "LOW";
    recommendation = "Self-sufficient household. Recommended for skill development or small business loans.";
  }

  return {
    score: finalScore,
    category,
    perCapitaIncome,
    dependentsRatio,
    reasons,
    recommendation,
  };
}

export async function createHousehold(data: HouseholdFormInput) {
  try {
    await requireServerSession();
    const validated = householdFormSchema.parse(data);

    // Calculate household metrics
    const totalMembers = validated.members.length;
    const dependents = validated.members.filter((m) => m.isDependent).length;
    const disabledCount = validated.members.filter((m) => m.isDisable).length;
    const elderlyCount = validated.members.filter((m) => m.isElderly || (m.age ?? 0) >= 60).length;
    const childrenCount = validated.members.filter((m) => m.relationToHead === "SON" || m.relationToHead === "DAUGHTER" || (m.age ?? 120) < 18).length;

    const fixedMonthlyIncome = validated.monthlyIncome || 0;
    const memberIncome = validated.members.reduce((sum, m) => sum + (m.monthlyIncome || 0), 0);
    const totalIncome = fixedMonthlyIncome + memberIncome;

    const assessment = await calculateWelfareAssessment({
      monthlyIncome: totalIncome,
      totalMembers,
      dependents,
      disabledCount,
      elderlyCount,
      childrenCount,
      housingType: validated.housingType,
      housingCondition: validated.housingCondition,
    });

    const year = new Date().getFullYear();
    const household = await prisma.$transaction(async (tx) => {
      const [sequence] = await tx.$queryRaw<Array<{ nextValue: number }>>`
        INSERT INTO "household_code_sequence" ("year", "nextValue")
        VALUES (${year}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "nextValue" = "household_code_sequence"."nextValue" + 1
        RETURNING "nextValue"
      `;
      const householdCode = `HH-${year}-${String(Number(sequence.nextValue)).padStart(4, "0")}`;

      const createdHousehold = await tx.household.create({
        data: {
          householdCode,
          name: validated.name,
          headBeneficiaryId: validated.headBeneficiaryId || null,
          fixedMonthlyIncome,
          monthlyIncome: totalIncome,
          totalMembers,
          dependents,
          elderlyCount,
          disabledCount,
          childrenCount,
          housingType: validated.housingType,
          housingCondition: validated.housingCondition,
          vulnerabilityScore: assessment.score,
          vulnerabilityCategory: assessment.category,
          notes: validated.notes,
          members: {
            create: validated.members.map((m) => ({
              fullName: m.fullName,
              cnic: m.cnic || null,
              relationToHead: m.relationToHead,
              age: m.age ?? null,
              gender: m.gender || null,
              employmentStatus: m.employmentStatus || null,
              monthlyIncome: m.monthlyIncome || 0,
              isDisable: m.isDisable,
              isElderly: m.isElderly,
              isDependent: m.isDependent,
              healthCondition: m.healthCondition || null,
              beneficiaryId: m.beneficiaryId || null,
            })),
          },
        },
        include: {
          members: true,
        },
      });

      if (validated.headBeneficiaryId) {
        await tx.beneficiary.update({
          where: { id: validated.headBeneficiaryId },
          data: { householdId: createdHousehold.id },
        });
      }

      return createdHousehold;
    });

    revalidatePath("/dashboard/households");
    return { success: true, id: household.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create household";
    return { success: false, error: message };
  }
}

export async function getHouseholds(params?: {
  search?: string;
  category?: string;
  housingType?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requireServerSession();
    const page = Math.max(params?.page || 1, 1);
    const limit = Math.min(params?.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.category && params.category !== "ALL") {
      where.vulnerabilityCategory = params.category;
    }

    if (params?.housingType && params.housingType !== "ALL") {
      where.housingType = params.housingType;
    }

    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { householdCode: { contains: q, mode: "insensitive" } },
        { headBeneficiary: { name: { contains: q, mode: "insensitive" } } },
        { headBeneficiary: { cnic: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.household.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          headBeneficiary: {
            select: { id: true, name: true, cnic: true, phone: true },
          },
          _count: {
            select: { members: true, documents: true },
          },
        },
      }),
      prisma.household.count({ where }),
    ]);

    const formattedItems = items.map((h) => ({
      ...h,
      monthlyIncome: h.monthlyIncome ? Number(h.monthlyIncome) : 0,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
    }));

    return {
      items: formattedItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 1 };
  }
}

export async function getBeneficiaryOptions(params?: { search?: string; page?: number; limit?: number }) {
  await requireServerSession();
  const page = Math.max(params?.page || 1, 1);
  const limit = Math.min(params?.limit || 25, 100);
  const search = params?.search?.trim();
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { cnic: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.beneficiary.findMany({
      where,
      select: { id: true, name: true, cnic: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.beneficiary.count({ where }),
  ]);

  return { items, page, totalPages: Math.max(Math.ceil(total / limit), 1) };
}

export async function getHouseholdById(id: string) {
  try {
    await requireServerSession();
    const household = await prisma.household.findUnique({
      where: { id },
      include: {
        headBeneficiary: {
          include: {
            address: true,
          },
        },
        members: {
          orderBy: { createdAt: "asc" },
        },
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!household) return null;

    const monthlyIncome = household.monthlyIncome ? Number(household.monthlyIncome) : 0;

    const assessment = await calculateWelfareAssessment({
      monthlyIncome,
      totalMembers: household.totalMembers,
      dependents: household.dependents,
      disabledCount: household.disabledCount,
      elderlyCount: household.elderlyCount,
      childrenCount: household.childrenCount,
      housingType: household.housingType,
      housingCondition: household.housingCondition,
    });

    return {
      ...household,
      monthlyIncome,
      createdAt: household.createdAt.toISOString(),
      updatedAt: household.updatedAt.toISOString(),
      assessment,
      members: household.members.map((m) => ({
        ...m,
        monthlyIncome: m.monthlyIncome ? Number(m.monthlyIncome) : 0,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
      documents: household.documents.map((d) => ({
        ...d,
        uploadedAt: d.uploadedAt.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

export async function getHouseholdStats() {
  try {
    await requireServerSession();
    const [total, critical, high, totalMembersAgg] = await Promise.all([
      prisma.household.count(),
      prisma.household.count({ where: { vulnerabilityCategory: "CRITICAL" } }),
      prisma.household.count({ where: { vulnerabilityCategory: "HIGH" } }),
      prisma.household.aggregate({
        _sum: {
          totalMembers: true,
          dependents: true,
          disabledCount: true,
        },
      }),
    ]);

    return {
      total,
      critical,
      high,
      totalMembers: totalMembersAgg._sum.totalMembers || 0,
      totalDependents: totalMembersAgg._sum.dependents || 0,
      totalDisabled: totalMembersAgg._sum.disabledCount || 0,
    };
  } catch {
    return {
      total: 0,
      critical: 0,
      high: 0,
      totalMembers: 0,
      totalDependents: 0,
      totalDisabled: 0,
    };
  }
}

export async function addHouseholdMember(householdId: string, data: HouseholdMemberInput) {
  try {
    await requireServerSession();
    const validated = householdMemberSchema.parse(data);

    const member = await prisma.householdMember.create({
      data: {
        householdId,
        fullName: validated.fullName,
        cnic: validated.cnic || null,
        relationToHead: validated.relationToHead,
        age: validated.age ?? null,
        gender: validated.gender || null,
        employmentStatus: validated.employmentStatus || null,
        monthlyIncome: validated.monthlyIncome || 0,
        isDisable: validated.isDisable,
        isElderly: validated.isElderly,
        isDependent: validated.isDependent,
        healthCondition: validated.healthCondition || null,
        beneficiaryId: validated.beneficiaryId || null,
      },
    });

    // Recalculate household counts and score
    await syncHouseholdMetrics(householdId);

    revalidatePath(`/dashboard/households/${householdId}`);
    return { success: true, member };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add member";
    return { success: false, error: message };
  }
}

export async function deleteHouseholdMember(memberId: string, householdId: string) {
  try {
    await requireServerSession();
    const member = await prisma.householdMember.findUnique({
      where: { id: memberId },
      select: { householdId: true },
    });

    if (!member || member.householdId !== householdId) {
      return { success: false, error: "Member does not belong to this household" };
    }

    await prisma.householdMember.delete({ where: { id: memberId } });

    await syncHouseholdMetrics(member.householdId);

    revalidatePath(`/dashboard/households/${householdId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete member" };
  }
}

export async function addHouseholdDocument(householdId: string, data: HouseholdDocumentInput) {
  try {
    await requireServerSession();
    const validated = householdDocumentSchema.parse(data);

    const doc = await prisma.householdDocument.create({
      data: {
        householdId,
        title: validated.title,
        type: validated.type,
        fileUrl: validated.fileUrl,
      },
    });

    revalidatePath(`/dashboard/households/${householdId}`);
    return { success: true, doc };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload document";
    return { success: false, error: message };
  }
}

export async function deleteHousehold(id: string) {
  try {
    await requireServerSession();
    await prisma.household.delete({ where: { id } });

    revalidatePath("/dashboard/households");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete household" };
  }
}

async function syncHouseholdMetrics(householdId: string) {
  const members = await prisma.householdMember.findMany({ where: { householdId } });
  const household = await prisma.household.findUnique({ where: { id: householdId } });

  if (!household) return;

  const totalMembers = members.length;
  const dependents = members.filter((m) => m.isDependent).length;
  const disabledCount = members.filter((m) => m.isDisable).length;
  const elderlyCount = members.filter((m) => m.isElderly || (m.age && m.age >= 60)).length;
  const childrenCount = members.filter((m) => m.relationToHead === "SON" || m.relationToHead === "DAUGHTER" || (m.age && m.age < 18)).length;

  const fixedMonthlyIncome = household.fixedMonthlyIncome ? Number(household.fixedMonthlyIncome) : 0;
  const memberIncome = members.reduce((sum, m) => sum + (m.monthlyIncome ? Number(m.monthlyIncome) : 0), 0);
  const totalIncome = fixedMonthlyIncome + memberIncome;

  const assessment = await calculateWelfareAssessment({
    monthlyIncome: totalIncome,
    totalMembers,
    dependents,
    disabledCount,
    elderlyCount,
    childrenCount,
    housingType: household.housingType,
    housingCondition: household.housingCondition,
  });

  await prisma.household.update({
    where: { id: householdId },
    data: {
      monthlyIncome: totalIncome,
      totalMembers,
      dependents,
      disabledCount,
      elderlyCount,
      childrenCount,
      vulnerabilityScore: assessment.score,
      vulnerabilityCategory: assessment.category,
    },
  });
}
