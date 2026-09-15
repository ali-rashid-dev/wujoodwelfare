"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/auth-server";
import {
  beneficiaryFormSchema,
  BeneficiaryFormInput,
  assistanceRecordSchema,
  AssistanceRecordInput,
  beneficiaryDocumentSchema,
  BeneficiaryDocumentInput,
  beneficiaryCaseSchema,
  BeneficiaryCaseInput,
} from "@/validation/beneficiary";
import {
  Prisma,
  BeneficiaryStatus,
  Gender,
  MaritalStatus,
  EmploymentStatus,
  HousingType,
  AssistanceType,
  DocumentType,
} from "@prisma/client";

export async function createBeneficiary(data: BeneficiaryFormInput) {
  try {
    await requireServerSession();
    const validated = beneficiaryFormSchema.parse(data);

    if (validated.cnic) {
      const existing = await prisma.beneficiary.findUnique({
        where: { cnic: validated.cnic },
      });

      if (existing) {
        return {
          success: false,
          error: "A beneficiary with this CNIC already exists.",
        };
      }
    }

    const beneficiary = await prisma.beneficiary.create({
      data: {
        name: validated.name,
        cnic: validated.cnic || null,
        fatherName: validated.fatherName || null,
        dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
        gender: validated.gender as Gender,
        status: validated.status as BeneficiaryStatus,
        notes: validated.notes || null,
        verifiedAt: validated.isVerified ? new Date() : null,

        contact: validated.contact && (validated.contact.phone || validated.contact.email) ? {
          create: {
            phone: validated.contact.phone || null,
            phone2: validated.contact.phone2 || null,
            whatsapp: validated.contact.whatsapp || null,
            email: validated.contact.email || null,
          },
        } : undefined,

        address: validated.address && validated.address.city ? {
          create: {
            street: validated.address.street || null,
            city: validated.address.city || null,
            district: validated.address.district || null,
            province: validated.address.province || null,
            postalCode: validated.address.postalCode || null,
          },
        } : undefined,

        family: validated.family ? {
          create: {
            maritalStatus: validated.family.maritalStatus as MaritalStatus,
            spouseName: validated.family.spouseName || null,
            dependents: validated.family.dependents ?? 0,
            disabledMembers: validated.family.disabledMembers ?? 0,
          },
        } : undefined,

        economic: validated.economic ? {
          create: {
            employmentStatus: validated.economic.employmentStatus as EmploymentStatus,
            occupation: validated.economic.occupation || null,
            monthlyIncome: validated.economic.monthlyIncome ?? 0,
            housingType: validated.economic.housingType as HousingType,
          },
        } : undefined,
      },
    });

    revalidatePath("/dashboard/beneficiaries");
    return { success: true, beneficiaryId: beneficiary.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create beneficiary";
    return { success: false, error: errorMsg };
  }
}

export async function updateBeneficiary(id: string, data: BeneficiaryFormInput) {
  try {
    await requireServerSession();
    const validated = beneficiaryFormSchema.parse(data);
    const current = await prisma.beneficiary.findUnique({ where: { id }, select: { verifiedAt: true } });

    if (validated.cnic) {
      const existingCnic = await prisma.beneficiary.findFirst({
        where: {
          cnic: validated.cnic,
          NOT: { id },
        },
      });

      if (existingCnic) {
        return {
          success: false,
          error: "Another beneficiary with this CNIC already exists.",
        };
      }
    }

    await prisma.beneficiary.update({
      where: { id },
      data: {
        name: validated.name,
        cnic: validated.cnic || null,
        fatherName: validated.fatherName || null,
        dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
        gender: validated.gender as Gender,
        status: validated.status as BeneficiaryStatus,
        notes: validated.notes || null,
        verifiedAt: validated.isVerified ? (current?.verifiedAt ?? new Date()) : null,

        contact: validated.contact ? {
          upsert: {
            create: {
              phone: validated.contact.phone || null,
              phone2: validated.contact.phone2 || null,
              whatsapp: validated.contact.whatsapp || null,
              email: validated.contact.email || null,
            },
            update: {
              phone: validated.contact.phone || null,
              phone2: validated.contact.phone2 || null,
              whatsapp: validated.contact.whatsapp || null,
              email: validated.contact.email || null,
            },
          },
        } : undefined,

        address: validated.address ? {
          upsert: {
            create: {
              street: validated.address.street || null,
              city: validated.address.city || null,
              district: validated.address.district || null,
              province: validated.address.province || null,
              postalCode: validated.address.postalCode || null,
            },
            update: {
              street: validated.address.street || null,
              city: validated.address.city || null,
              district: validated.address.district || null,
              province: validated.address.province || null,
              postalCode: validated.address.postalCode || null,
            },
          },
        } : undefined,

        family: validated.family ? {
          upsert: {
            create: {
              maritalStatus: validated.family.maritalStatus as MaritalStatus,
              spouseName: validated.family.spouseName || null,
              dependents: validated.family.dependents ?? 0,
              disabledMembers: validated.family.disabledMembers ?? 0,
            },
            update: {
              maritalStatus: validated.family.maritalStatus as MaritalStatus,
              spouseName: validated.family.spouseName || null,
              dependents: validated.family.dependents ?? 0,
              disabledMembers: validated.family.disabledMembers ?? 0,
            },
          },
        } : undefined,

        economic: validated.economic ? {
          upsert: {
            create: {
              employmentStatus: validated.economic.employmentStatus as EmploymentStatus,
              occupation: validated.economic.occupation || null,
              monthlyIncome: validated.economic.monthlyIncome ?? 0,
              housingType: validated.economic.housingType as HousingType,
            },
            update: {
              employmentStatus: validated.economic.employmentStatus as EmploymentStatus,
              occupation: validated.economic.occupation || null,
              monthlyIncome: validated.economic.monthlyIncome ?? 0,
              housingType: validated.economic.housingType as HousingType,
            },
          },
        } : undefined,
      },
    });

    revalidatePath("/dashboard/beneficiaries");
    revalidatePath(`/dashboard/beneficiaries/${id}`);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update beneficiary";
    return { success: false, error: errorMsg };
  }
}

export async function deleteBeneficiary(id: string) {
  try {
    await requireServerSession();
    await prisma.beneficiary.delete({ where: { id } });
    revalidatePath("/dashboard/beneficiaries");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete beneficiary";
    return { success: false, error: errorMsg };
  }
}

export async function updateBeneficiaryStatus(
  id: string,
  status: BeneficiaryStatus,
  isVerified?: boolean
) {
  try {
    await requireServerSession();
    const current = isVerified
      ? await prisma.beneficiary.findUnique({ where: { id }, select: { verifiedAt: true } })
      : null;
    await prisma.beneficiary.update({
      where: { id },
      data: {
        status,
        ...(isVerified !== undefined
          ? { verifiedAt: isVerified ? (current?.verifiedAt ?? new Date()) : null }
          : {}),
      },
    });
    revalidatePath("/dashboard/beneficiaries");
    revalidatePath(`/dashboard/beneficiaries/${id}`);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update status";
    return { success: false, error: errorMsg };
  }
}

export async function addAssistanceRecord(beneficiaryId: string, data: AssistanceRecordInput) {
  try {
    await requireServerSession();
    const validated = assistanceRecordSchema.parse(data);

    const record = await prisma.assistanceRecord.create({
      data: {
        beneficiaryId,
        type: validated.type as AssistanceType,
        amount: validated.amount ?? null,
        description: validated.description,
        givenAt: new Date(validated.givenAt),
        givenBy: validated.givenBy || null,
      },
    });

    revalidatePath(`/dashboard/beneficiaries/${beneficiaryId}`);
    return { success: true, record };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to add assistance record";
    return { success: false, error: errorMsg };
  }
}

export async function addBeneficiaryDocument(beneficiaryId: string, data: BeneficiaryDocumentInput) {
  try {
    await requireServerSession();
    const validated = beneficiaryDocumentSchema.parse(data);

    const document = await prisma.beneficiaryDocument.create({
      data: {
        beneficiaryId,
        label: validated.label,
        type: validated.type as DocumentType,
        fileUrl: validated.fileUrl,
      },
    });

    revalidatePath(`/dashboard/beneficiaries/${beneficiaryId}`);
    return { success: true, document };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to add document";
    return { success: false, error: errorMsg };
  }
}

export async function deleteBeneficiaryDocument(documentId: string, beneficiaryId: string) {
  try {
    await requireServerSession();
    const result = await prisma.beneficiaryDocument.deleteMany({
      where: { id: documentId, beneficiaryId },
    });
    if (result.count === 0) {
      return { success: false, error: "Document not found for this beneficiary" };
    }
    revalidatePath(`/dashboard/beneficiaries/${beneficiaryId}`);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete document";
    return { success: false, error: errorMsg };
  }
}

export async function addBeneficiaryCase(beneficiaryId: string, data: BeneficiaryCaseInput) {
  try {
    await requireServerSession();
    const validated = beneficiaryCaseSchema.parse(data);

    const newCase = await prisma.beneficiaryCase.create({
      data: {
        beneficiaryId,
        title: validated.title,
        description: validated.description,
        isOpen: validated.isOpen ?? true,
      },
    });

    revalidatePath(`/dashboard/beneficiaries/${beneficiaryId}`);
    return { success: true, case: newCase };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create case";
    return { success: false, error: errorMsg };
  }
}

export async function getBeneficiary(id: string) {
  try {
    await requireServerSession();
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id },
      include: {
        contact: true,
        address: true,
        family: true,
        economic: true,
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
        cases: {
          orderBy: { openedAt: "desc" },
        },
        assistanceHistory: {
          orderBy: { givenAt: "desc" },
        },
      },
    });

    if (!beneficiary) return null;
    return {
      ...beneficiary,
      economic: beneficiary.economic
        ? { ...beneficiary.economic, monthlyIncome: beneficiary.economic.monthlyIncome === null ? null : Number(beneficiary.economic.monthlyIncome) }
        : null,
      assistanceHistory: beneficiary.assistanceHistory.map((record) => ({
        ...record,
        amount: record.amount === null ? null : Number(record.amount),
      })),
    };
  } catch {
    return null;
  }
}

export async function getBeneficiaries(params?: {
  search?: string;
  status?: string;
  gender?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requireServerSession();
    const requestedPage = params?.page;
    const requestedLimit = params?.limit;
    const page = typeof requestedPage === "number" && Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = typeof requestedLimit === "number" && Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BeneficiaryWhereInput = {};

    if (params?.status && params.status !== "ALL") {
      const status = Object.values(BeneficiaryStatus).find((value) => value === params.status);
      if (status) where.status = status;
    }

    if (params?.gender && params.gender !== "ALL") {
      const gender = Object.values(Gender).find((value) => value === params.gender);
      if (gender) where.gender = gender;
    }

    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { cnic: { contains: q, mode: "insensitive" } },
        { contact: { phone: { contains: q, mode: "insensitive" } } },
        { address: { city: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.beneficiary.findMany({
        where,
        include: {
          contact: true,
          address: true,
          family: true,
          economic: true,
          assistanceHistory: {
            orderBy: { givenAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              documents: true,
              cases: true,
              assistanceHistory: true,
            },
          },
        },
        orderBy: { registeredAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.beneficiary.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        economic: item.economic
          ? { ...item.economic, monthlyIncome: item.economic.monthlyIncome === null ? null : Number(item.economic.monthlyIncome) }
          : null,
        assistanceHistory: item.assistanceHistory.map((record) => ({
          ...record,
          amount: record.amount === null ? null : Number(record.amount),
        })),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getBeneficiaryStats() {
  try {
    await requireServerSession();
    const [total, verified, pending, active, totalAssistance] = await Promise.all([
      prisma.beneficiary.count(),
      prisma.beneficiary.count({ where: { verifiedAt: { not: null } } }),
      prisma.beneficiary.count({ where: { status: "PENDING" } }),
      prisma.beneficiary.count({ where: { status: "ACTIVE" } }),
      prisma.assistanceRecord.aggregate({
        _sum: { amount: true },
      }),
    ]);

    return {
      total,
      verified,
      pending,
      active,
      totalAssistanceAmount: totalAssistance._sum.amount === null ? 0 : Number(totalAssistance._sum.amount),
    };
  } catch {
    return { total: 0, verified: 0, pending: 0, active: 0, totalAssistanceAmount: 0 };
  }
}
