"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/auth-server";
import {
  staffFormSchema,
  StaffFormInput,
  caseAssignmentSchema,
  CaseAssignmentInput,
  staffActivitySchema,
  StaffActivityInput,
} from "@/validation/staff";
import { StaffRole, StaffDepartment, StaffStatus } from "@prisma/client";

export async function createStaff(data: StaffFormInput) {
  try {
    await requireServerSession();
    const validated = staffFormSchema.parse(data);

    // Check duplicate email
    const existing = await prisma.staff.findUnique({
      where: { email: validated.email },
    });
    if (existing) {
      return { success: false, error: "A staff member with this email already exists." };
    }

    // Auto-generate employee code
    const year = new Date().getFullYear();
    const staff = await prisma.$transaction(async (tx) => {
      const [sequence] = await tx.$queryRaw<Array<{ nextValue: number }>>`
        INSERT INTO "staff_code_sequence" ("year", "nextValue")
        VALUES (${year}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "nextValue" = "staff_code_sequence"."nextValue" + 1
        RETURNING "nextValue"
      `;
      const employeeId = `EMP-${year}-${String(Number(sequence.nextValue)).padStart(4, "0")}`;
      const createdStaff = await tx.staff.create({
        data: {
          employeeId,
          name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
          designation: validated.designation,
          role: validated.role as StaffRole,
          department: validated.department as StaffDepartment,
          status: validated.status as StaffStatus,
          permissions: validated.permissions,
          joinedAt: validated.joinedAt ? new Date(validated.joinedAt) : new Date(),
          emergencyContact: validated.emergencyContact || null,
          notes: validated.notes || null,
        },
      });

      await tx.staffActivity.create({
        data: {
          staffId: createdStaff.id,
          action: "Staff Profile Created",
          description: `Registered as ${createdStaff.designation} in ${createdStaff.department}`,
        },
      });

      return createdStaff;
    });

    revalidatePath("/dashboard/staff");
    return { success: true, id: staff.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create staff profile";
    return { success: false, error: message };
  }
}

export async function updateStaff(id: string, data: StaffFormInput) {
  try {
    await requireServerSession();
    const validated = staffFormSchema.parse(data);

    const existingEmail = await prisma.staff.findFirst({
      where: {
        email: validated.email,
        NOT: { id },
      },
    });
    if (existingEmail) {
      return { success: false, error: "Another staff member with this email already exists." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedStaff = await tx.staff.update({
        where: { id },
        data: {
          name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
          designation: validated.designation,
          role: validated.role as StaffRole,
          department: validated.department as StaffDepartment,
          status: validated.status as StaffStatus,
          permissions: validated.permissions,
          joinedAt: validated.joinedAt ? new Date(validated.joinedAt) : undefined,
          emergencyContact: validated.emergencyContact || null,
          notes: validated.notes || null,
        },
      });

      await tx.staffActivity.create({
        data: {
          staffId: id,
          action: "Staff Profile Updated",
          description: `Updated profile details and permissions`,
        },
      });

      return updatedStaff;
    });

    revalidatePath("/dashboard/staff");
    revalidatePath(`/dashboard/staff/${id}`);
    return { success: true, staff: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update staff profile";
    return { success: false, error: message };
  }
}

export async function deleteStaff(id: string) {
  try {
    await requireServerSession();
    await prisma.staff.delete({ where: { id } });

    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete staff member";
    return { success: false, error: message };
  }
}

export async function getStaffList(params?: {
  search?: string;
  role?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requireServerSession();
    const page = Math.max(params?.page || 1, 1);
    const limit = Math.min(params?.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.role && params.role !== "ALL") {
      where.role = params.role;
    }
    if (params?.department && params.department !== "ALL") {
      where.department = params.department;
    }
    if (params?.status && params.status !== "ALL") {
      where.status = params.status;
    }
    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { employeeId: { contains: q, mode: "insensitive" } },
        { designation: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { assignedCases: true, activities: true },
          },
        },
      }),
      prisma.staff.count({ where }),
    ]);

    const formattedItems = items.map((s) => ({
      ...s,
      joinedAt: s.joinedAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
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

export async function getStaffById(id: string) {
  try {
    await requireServerSession();
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        assignedCases: {
          orderBy: { assignedAt: "desc" },
          include: {
            caseItem: {
              include: {
                beneficiary: {
                  select: { id: true, name: true, cnic: true, phone: true },
                },
              },
            },
          },
        },
        activities: {
          orderBy: { performedAt: "desc" },
          take: 50,
        },
      },
    });

    if (!staff) return null;

    return {
      ...staff,
      joinedAt: staff.joinedAt.toISOString(),
      createdAt: staff.createdAt.toISOString(),
      updatedAt: staff.updatedAt.toISOString(),
      assignedCases: staff.assignedCases.map((c) => ({
        ...c,
        assignedAt: c.assignedAt.toISOString(),
        caseItem: {
          ...c.caseItem,
          openedAt: c.caseItem.openedAt.toISOString(),
          closedAt: c.caseItem.closedAt ? c.caseItem.closedAt.toISOString() : null,
        },
      })),
      activities: staff.activities.map((a) => ({
        ...a,
        performedAt: a.performedAt.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

export async function getStaffStats() {
  try {
    await requireServerSession();
    const [total, active, fieldOfficers, caseManagers] = await Promise.all([
      prisma.staff.count(),
      prisma.staff.count({ where: { status: "ACTIVE" } }),
      prisma.staff.count({ where: { role: "FIELD_OFFICER" } }),
      prisma.staff.count({ where: { role: "CASE_MANAGER" } }),
    ]);

    return {
      total,
      active,
      fieldOfficers,
      caseManagers,
    };
  } catch {
    return { total: 0, active: 0, fieldOfficers: 0, caseManagers: 0 };
  }
}

export async function assignCaseToStaff(staffId: string, data: CaseAssignmentInput) {
  try {
    await requireServerSession();
    const validated = caseAssignmentSchema.parse(data);

    const assignment = await prisma.$transaction(async (tx) => {
      const createdAssignment = await tx.caseAssignment.create({
        data: {
          staffId,
          caseId: validated.caseId,
          roleInCase: validated.roleInCase,
          notes: validated.notes || null,
        },
        include: {
          caseItem: true,
        },
      });

      await tx.staffActivity.create({
        data: {
          staffId,
          action: "Case Assigned",
          description: `Assigned case "${createdAssignment.caseItem.title}" as ${validated.roleInCase}`,
          targetType: "BeneficiaryCase",
          targetId: validated.caseId,
        },
      });

      return createdAssignment;
    });

    revalidatePath(`/dashboard/staff/${staffId}`);
    return { success: true, assignment };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign case";
    return { success: false, error: message };
  }
}

export async function logStaffActivity(staffId: string, data: StaffActivityInput) {
  try {
    await requireServerSession();
    const validated = staffActivitySchema.parse(data);

    const activity = await prisma.staffActivity.create({
      data: {
        staffId,
        action: validated.action,
        description: validated.description || null,
        targetType: validated.targetType || null,
        targetId: validated.targetId || null,
      },
    });

    revalidatePath(`/dashboard/staff/${staffId}`);
    return { success: true, activity };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to log activity";
    return { success: false, error: message };
  }
}

export async function getAvailableCasesForStaff(params?: { search?: string; page?: number; limit?: number }) {
  try {
    await requireServerSession();
    const page = Math.max(params?.page || 1, 1);
    const limit = Math.min(params?.limit || 25, 100);
    const search = params?.search?.trim();
    const where = {
      isOpen: true,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { beneficiary: { name: { contains: search, mode: "insensitive" as const } } },
              { beneficiary: { cnic: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [cases, total] = await Promise.all([
      prisma.beneficiaryCase.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ openedAt: "desc" }, { id: "asc" }],
        include: { beneficiary: { select: { name: true, cnic: true } } },
      }),
      prisma.beneficiaryCase.count({ where }),
    ]);

    return {
      items: cases.map((c) => ({
        id: c.id,
        title: c.title,
        beneficiaryName: c.beneficiary.name,
        beneficiaryCnic: c.beneficiary.cnic,
      })),
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
  } catch {
    return { items: [], page: 1, totalPages: 1 };
  }
}
