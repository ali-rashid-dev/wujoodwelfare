"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/auth-server";
import {
  volunteerFormSchema,
  VolunteerFormInput,
  campaignFormSchema,
  CampaignFormInput,
  campaignAssignmentSchema,
  CampaignAssignmentInput,
  volunteerActivitySchema,
  VolunteerActivityInput,
} from "@/validation/volunteer";
import { VolunteerStatus, VolunteerAvailability } from "@prisma/client";

export async function createVolunteer(data: VolunteerFormInput) {
  try {
    await requireServerSession();
    const validated = volunteerFormSchema.parse(data);

    if (validated.cnic) {
      const existing = await prisma.volunteer.findUnique({
        where: { cnic: validated.cnic },
      });
      if (existing) {
        return { success: false, error: "A volunteer with this CNIC already exists." };
      }
    }

    const year = new Date().getFullYear();
    const volunteer = await prisma.$transaction(async (tx) => {
      const [sequence] = await tx.$queryRaw<Array<{ nextValue: number }>>`
        INSERT INTO "volunteer_code_sequence" ("year", "nextValue")
        VALUES (${year}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "nextValue" = "volunteer_code_sequence"."nextValue" + 1
        RETURNING "nextValue"
      `;
      const volunteerCode = `VOL-${year}-${String(Number(sequence.nextValue)).padStart(4, "0")}`;
      const createdVolunteer = await tx.volunteer.create({
        data: {
          volunteerCode,
          name: validated.name,
          cnic: validated.cnic || null,
          email: validated.email,
          phone: validated.phone,
          status: validated.status as VolunteerStatus,
          skills: validated.skills,
          availability: validated.availability as VolunteerAvailability,
          city: validated.city || null,
          district: validated.district || null,
          area: validated.area || null,
          address: validated.address || null,
          notes: validated.notes || null,
        },
      });

      await tx.volunteerActivity.create({
        data: {
          volunteerId: createdVolunteer.id,
          title: "Registered as Volunteer",
          description: `Application registered with status ${createdVolunteer.status}`,
          hours: 0,
        },
      });

      return createdVolunteer;
    });

    revalidatePath("/dashboard/volunteers");
    return { success: true, id: volunteer.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to register volunteer";
    return { success: false, error: message };
  }
}

export async function updateVolunteer(id: string, data: VolunteerFormInput) {
  try {
    await requireServerSession();
    const validated = volunteerFormSchema.parse(data);

    if (validated.cnic) {
      const existingCnic = await prisma.volunteer.findFirst({
        where: {
          cnic: validated.cnic,
          NOT: { id },
        },
      });
      if (existingCnic) {
        return { success: false, error: "Another volunteer with this CNIC already exists." };
      }
    }

    const updated = await prisma.volunteer.update({
      where: { id },
      data: {
        name: validated.name,
        cnic: validated.cnic || null,
        email: validated.email,
        phone: validated.phone,
        status: validated.status as VolunteerStatus,
        skills: validated.skills,
        availability: validated.availability as VolunteerAvailability,
        city: validated.city || null,
        district: validated.district || null,
        area: validated.area || null,
        address: validated.address || null,
        notes: validated.notes || null,
      },
    });

    revalidatePath("/dashboard/volunteers");
    revalidatePath(`/dashboard/volunteers/${id}`);
    return { success: true, volunteer: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update volunteer";
    return { success: false, error: message };
  }
}

export async function deleteVolunteer(id: string) {
  try {
    await requireServerSession();
    await prisma.volunteer.delete({ where: { id } });

    revalidatePath("/dashboard/volunteers");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete volunteer";
    return { success: false, error: message };
  }
}

export async function getVolunteerList(params?: {
  search?: string;
  status?: string;
  availability?: string;
  skill?: string;
  city?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requireServerSession();
    const page = Math.max(params?.page || 1, 1);
    const limit = Math.min(params?.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.status && params.status !== "ALL") {
      where.status = params.status;
    }
    if (params?.availability && params.availability !== "ALL") {
      where.availability = params.availability;
    }
    if (params?.skill && params.skill !== "ALL") {
      where.skills = { has: params.skill };
    }
    if (params?.city && params.city !== "ALL") {
      where.city = { equals: params.city, mode: "insensitive" };
    }
    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { volunteerCode: { contains: q, mode: "insensitive" } },
        { cnic: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.volunteer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { campaignAssignments: true, activities: true },
          },
        },
      }),
      prisma.volunteer.count({ where }),
    ]);

    const formattedItems = items.map((v) => ({
      ...v,
      rating: v.rating ? Number(v.rating) : null,
      joinedAt: v.joinedAt.toISOString(),
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
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

export async function getVolunteerById(id: string) {
  try {
    await requireServerSession();
    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: {
        campaignAssignments: {
          orderBy: { assignedAt: "desc" },
          include: {
            campaign: true,
          },
        },
        activities: {
          orderBy: { activityDate: "desc" },
        },
      },
    });

    if (!volunteer) return null;

    return {
      ...volunteer,
      rating: volunteer.rating ? Number(volunteer.rating) : null,
      joinedAt: volunteer.joinedAt.toISOString(),
      createdAt: volunteer.createdAt.toISOString(),
      updatedAt: volunteer.updatedAt.toISOString(),
      campaignAssignments: volunteer.campaignAssignments.map((ca) => ({
        ...ca,
        assignedAt: ca.assignedAt.toISOString(),
        campaign: {
          ...ca.campaign,
          startDate: ca.campaign.startDate.toISOString(),
          endDate: ca.campaign.endDate ? ca.campaign.endDate.toISOString() : null,
          createdAt: ca.campaign.createdAt.toISOString(),
          updatedAt: ca.campaign.updatedAt.toISOString(),
        },
      })),
      activities: volunteer.activities.map((a) => ({
        ...a,
        activityDate: a.activityDate.toISOString(),
        createdAt: a.createdAt.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

export async function getVolunteerStats() {
  try {
    await requireServerSession();
    const [total, active, hoursAgg, activeCampaigns] = await Promise.all([
      prisma.volunteer.count(),
      prisma.volunteer.count({ where: { status: "ACTIVE" } }),
      prisma.volunteer.aggregate({
        _sum: { totalHoursLogged: true },
      }),
      prisma.welfareCampaign.count({ where: { status: "ACTIVE" } }),
    ]);

    return {
      total,
      active,
      totalHours: hoursAgg._sum.totalHoursLogged || 0,
      activeCampaigns,
    };
  } catch {
    return { total: 0, active: 0, totalHours: 0, activeCampaigns: 0 };
  }
}

export async function assignVolunteerToCampaign(volunteerId: string, data: CampaignAssignmentInput) {
  try {
    await requireServerSession();
    const validated = campaignAssignmentSchema.parse(data);

    const assignment = await prisma.$transaction(async (tx) => {
      const createdAssignment = await tx.volunteerCampaignAssignment.create({
        data: {
          volunteerId,
          campaignId: validated.campaignId,
          role: validated.role || "Volunteer",
          hoursLogged: validated.hoursLogged || 0,
          status: validated.status || "ASSIGNED",
        },
        include: { campaign: true },
      });

      await tx.volunteerActivity.create({
        data: {
          volunteerId,
          title: `Assigned to Campaign: ${createdAssignment.campaign.title}`,
          description: `Assigned role: ${validated.role || "Volunteer"}`,
          hours: 0,
          location: createdAssignment.campaign.location || null,
        },
      });

      return createdAssignment;
    });

    revalidatePath(`/dashboard/volunteers/${volunteerId}`);
    return { success: true, assignment };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign campaign";
    return { success: false, error: message };
  }
}

export async function logVolunteerActivity(volunteerId: string, data: VolunteerActivityInput) {
  try {
    await requireServerSession();
    const validated = volunteerActivitySchema.parse(data);

    const activity = await prisma.$transaction(async (tx) => {
      const createdActivity = await tx.volunteerActivity.create({
        data: {
          volunteerId,
          title: validated.title,
          description: validated.description || null,
          hours: validated.hours,
          activityDate: validated.activityDate ? new Date(validated.activityDate) : new Date(),
          location: validated.location || null,
          feedback: validated.feedback || null,
        },
      });

      await tx.volunteer.update({
        where: { id: volunteerId },
        data: {
          totalHoursLogged: { increment: validated.hours },
        },
      });

      return createdActivity;
    });

    revalidatePath(`/dashboard/volunteers/${volunteerId}`);
    return { success: true, activity };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to log activity";
    return { success: false, error: message };
  }
}

// ─── Campaign Server Actions ──────────────────────────────────────────────────

export async function createCampaign(data: CampaignFormInput) {
  try {
    await requireServerSession();
    const validated = campaignFormSchema.parse(data);

    const year = new Date().getFullYear();
    const campaign = await prisma.$transaction(async (tx) => {
      const [sequence] = await tx.$queryRaw<Array<{ nextValue: number }>>`
        INSERT INTO "campaign_code_sequence" ("year", "nextValue")
        VALUES (${year}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "nextValue" = "campaign_code_sequence"."nextValue" + 1
        RETURNING "nextValue"
      `;
      const code = `CMP-${year}-${String(Number(sequence.nextValue)).padStart(4, "0")}`;

      return tx.welfareCampaign.create({
        data: {
          code,
          title: validated.title,
          description: validated.description || null,
          location: validated.location || null,
          startDate: new Date(validated.startDate),
          endDate: validated.endDate ? new Date(validated.endDate) : null,
          targetBeneficiaries: validated.targetBeneficiaries || null,
          status: validated.status,
        },
      });
    });

    revalidatePath("/dashboard/volunteers/campaigns");
    return { success: true, id: campaign.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create campaign";
    return { success: false, error: message };
  }
}

export async function getCampaignsList() {
  try {
    await requireServerSession();
    const campaigns = await prisma.welfareCampaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { volunteerAssignments: true },
        },
      },
    });

    return campaigns.map((c) => ({
      ...c,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate ? c.endDate.toISOString() : null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}
