"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/auth-server";
import {
  distributionFormSchema,
  DistributionFormInput,
  distributionCenterSchema,
  DistributionCenterInput,
  distributionStatusUpdateSchema,
  DistributionStatusUpdateInput,
} from "@/validation/distribution";
import { DistributionStatus, Prisma } from "@prisma/client";

export async function createDistribution(data: DistributionFormInput) {
  try {
    const session = await requireServerSession();
    const validated = distributionFormSchema.parse(data);

    const year = new Date().getFullYear();
    const createdRecord = await prisma.$transaction(async (tx) => {
      const [sequence] = await tx.$queryRaw<Array<{ nextValue: number }>>`
        INSERT INTO "distribution_code_sequence" ("year", "nextValue")
        VALUES (${year}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "nextValue" = "distribution_code_sequence"."nextValue" + 1
        RETURNING "nextValue"
      `;
      const distributionCode = `DIST-${year}-${String(Number(sequence.nextValue)).padStart(4, "0")}`;

      let centerName = validated.centerName || null;
      if (validated.centerId) {
        const centerObj = await tx.distributionCenter.findUnique({ where: { id: validated.centerId } });
        if (centerObj) centerName = centerObj.name;
      }

      const record = await tx.distributionRecord.create({
        data: {
          distributionCode,
          assistanceRecordId: validated.assistanceRecordId || null,
          beneficiaryId: validated.beneficiaryId,
          caseId: validated.caseId || null,
          programId: validated.programId || null,
          centerId: validated.centerId || null,
          centerName: centerName || "Central Relief Warehouse",
          itemsSummary: validated.itemsSummary,
          quantity: validated.quantity,
          status: "APPROVED",
          scheduledDate: validated.scheduledDate ? new Date(validated.scheduledDate) : null,
          staffName: validated.staffName || session.user?.name || "Field Officer",
          recipientName: validated.recipientName || null,
          recipientCnic: validated.recipientCnic || null,
        },
      });

      await tx.distributionLog.create({
        data: {
          distributionId: record.id,
          toStatus: "APPROVED",
          action: "Distribution Approved & Created",
          performedBy: session.user?.name || "Field Officer",
          notes: `Package distribution created for ${validated.itemsSummary} (Qty: ${validated.quantity}). Code: ${distributionCode}`,
        },
      });

      return record;
    });

    revalidatePath("/dashboard/distribution");
    return { success: true, id: createdRecord.id, code: createdRecord.distributionCode };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create distribution delivery task";
    return { success: false, error: message };
  }
}

export async function updateDistributionStatus(id: string, data: DistributionStatusUpdateInput) {
  try {
    const session = await requireServerSession();
    const validated = distributionStatusUpdateSchema.parse(data);

    const targetStatus = validated.targetStatus as DistributionStatus;
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.distributionRecord.findUnique({ where: { id } });
      if (!existing) throw new Error("Distribution record not found");

      const updateData: Prisma.DistributionRecordUpdateInput = {
        status: targetStatus,
      };

      if (targetStatus === "SCHEDULED") {
        updateData.scheduledDate = existing.scheduledDate || now;
      } else if (targetStatus === "DISTRIBUTED") {
        updateData.distributedAt = now;
      } else if (targetStatus === "BENEFICIARY_CONFIRMED") {
        updateData.confirmedAt = now;
      }

      if (validated.recipientName) updateData.recipientName = validated.recipientName;
      if (validated.recipientCnic) updateData.recipientCnic = validated.recipientCnic;
      if (validated.receiptNumber) updateData.receiptNumber = validated.receiptNumber;
      if (validated.proofPhotoUrl) updateData.proofPhotoUrl = validated.proofPhotoUrl;
      if (validated.confirmationNotes) updateData.confirmationNotes = validated.confirmationNotes;

      const updated = await tx.distributionRecord.update({
        where: { id },
        data: updateData,
      });

      await tx.distributionLog.create({
        data: {
          distributionId: id,
          fromStatus: existing.status,
          toStatus: targetStatus,
          action: `Status advanced to ${targetStatus}`,
          performedBy: session.user?.name || "Field Officer",
          notes: validated.confirmationNotes || `Package status updated to ${targetStatus}`,
        },
      });

      return updated;
    });

    revalidatePath("/dashboard/distribution");
    revalidatePath(`/dashboard/distribution/${id}`);
    return { success: true, record: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update distribution status";
    return { success: false, error: message };
  }
}

export async function createDistributionCenter(data: DistributionCenterInput) {
  try {
    await requireServerSession();
    const validated = distributionCenterSchema.parse(data);

    const year = new Date().getFullYear();
    const center = await prisma.$transaction(async (tx) => {
      const [sequence] = await tx.$queryRaw<Array<{ nextValue: number }>>`
        INSERT INTO "distribution_code_sequence" ("year", "nextValue")
        VALUES (${year}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "nextValue" = "distribution_code_sequence"."nextValue" + 1
        RETURNING "nextValue"
      `;
      const code = `DC-${validated.city.slice(0, 3).toUpperCase()}-${String(Number(sequence.nextValue)).padStart(2, "0")}`;

      return tx.distributionCenter.create({
        data: {
          code,
          name: validated.name,
          city: validated.city,
          address: validated.address,
          inChargeName: validated.inChargeName || null,
          phone: validated.phone || null,
          isActive: validated.isActive,
        },
      });
    });

    revalidatePath("/dashboard/distribution");
    return { success: true, center };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create distribution center";
    return { success: false, error: message };
  }
}

export async function getDistributionList(params?: {
  search?: string;
  status?: string;
  centerId?: string;
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

    const where: Prisma.DistributionRecordWhereInput = {};

    if (params?.status && params.status !== "ALL") {
      where.status = params.status as DistributionStatus;
    }

    if (params?.centerId && params.centerId !== "ALL") {
      where.centerId = params.centerId;
    }

    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { distributionCode: { contains: q, mode: "insensitive" } },
        { itemsSummary: { contains: q, mode: "insensitive" } },
        { recipientName: { contains: q, mode: "insensitive" } },
        { recipientCnic: { contains: q, mode: "insensitive" } },
        { staffName: { contains: q, mode: "insensitive" } },
        { centerName: { contains: q, mode: "insensitive" } },
        { beneficiary: { name: { contains: q, mode: "insensitive" } } },
        { beneficiary: { cnic: { contains: q, mode: "insensitive" } } },
        { receiptNumber: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.distributionRecord.findMany({
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
          program: {
            select: { id: true, code: true, name: true },
          },
          center: {
            select: { id: true, code: true, name: true, city: true },
          },
          _count: {
            select: { logs: true },
          },
        },
      }),
      prisma.distributionRecord.count({ where }),
    ]);

    const formattedItems = items.map((rec) => ({
      ...rec,
      scheduledDate: rec.scheduledDate ? rec.scheduledDate.toISOString() : null,
      distributedAt: rec.distributedAt ? rec.distributedAt.toISOString() : null,
      confirmedAt: rec.confirmedAt ? rec.confirmedAt.toISOString() : null,
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

export async function getDistributionById(id: string) {
  try {
    await requireServerSession();
    const record = await prisma.distributionRecord.findUnique({
      where: { id },
      include: {
        beneficiary: {
          include: {
            address: true,
            family: true,
          },
        },
        caseItem: true,
        program: true,
        center: true,
        assistanceRecord: true,
        logs: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!record) return null;

    return {
      ...record,
      scheduledDate: record.scheduledDate ? record.scheduledDate.toISOString() : null,
      distributedAt: record.distributedAt ? record.distributedAt.toISOString() : null,
      confirmedAt: record.confirmedAt ? record.confirmedAt.toISOString() : null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      beneficiary: record.beneficiary
        ? {
            ...record.beneficiary,
            registeredAt: record.beneficiary.registeredAt.toISOString(),
          }
        : null,
      logs: record.logs.map((l) => ({
        ...l,
        timestamp: l.timestamp.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

export async function getDistributionStats() {
  try {
    await requireServerSession();
    const [total, approved, scheduled, distributed, confirmed, failed] = await Promise.all([
      prisma.distributionRecord.count(),
      prisma.distributionRecord.count({ where: { status: "APPROVED" } }),
      prisma.distributionRecord.count({ where: { status: "SCHEDULED" } }),
      prisma.distributionRecord.count({ where: { status: "DISTRIBUTED" } }),
      prisma.distributionRecord.count({ where: { status: "BENEFICIARY_CONFIRMED" } }),
      prisma.distributionRecord.count({ where: { status: "FAILED_DELIVERY" } }),
    ]);

    return {
      total,
      approved,
      scheduled,
      distributed,
      confirmed,
      failed,
    };
  } catch {
    return {
      total: 0,
      approved: 0,
      scheduled: 0,
      distributed: 0,
      confirmed: 0,
      failed: 0,
    };
  }
}

export async function getDistributionCenters() {
  try {
    await requireServerSession();
    return await prisma.distributionCenter.findMany({
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getDistributionOptions() {
  try {
    await requireServerSession();
    const [beneficiaries, cases, programs, centers, assistanceRecords] = await Promise.all([
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
        select: { id: true, code: true, name: true },
      }),
      prisma.distributionCenter.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, code: true, name: true, city: true },
      }),
      prisma.assistanceRecord.findMany({
        orderBy: { givenAt: "desc" },
        take: 100,
        select: { id: true, assistanceCode: true, type: true, quantity: true, beneficiary: { select: { name: true, cnic: true } } },
      }),
    ]);

    return { beneficiaries, cases, programs, centers, assistanceRecords };
  } catch {
    return { beneficiaries: [], cases: [], programs: [], centers: [], assistanceRecords: [] };
  }
}
