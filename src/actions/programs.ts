"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import {
  programSchema,
  programStatusSchema,
  type ProgramInput,
  type ProgramStatus,
} from "@/validation/program";

export type ProgramRecord = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  targetBeneficiaries: number;
  currentBeneficiaries: number;
  budget: number | null;
  status: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let clean = slugify(baseSlug) || "program";
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? clean : `${clean}-${suffix}`;
    const existing = await prisma.program.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return candidate;
    }
    suffix++;
  }
}

/**
 * Public function to fetch only published programs
 */
export async function getPublishedPrograms(): Promise<ProgramRecord[]> {
  try {
    const items = await prisma.program.findMany({
      where: {
        status: { in: ["published", "active"] },
      },
      orderBy: { createdAt: "asc" },
    });
    return items;
  } catch (error) {
    console.error("Failed to fetch published programs:", error);
    return [];
  }
}

/**
 * Public function to fetch a single published program by slug
 */
export async function getPublishedProgramBySlug(slug: string): Promise<ProgramRecord | null> {
  try {
    const program = await prisma.program.findFirst({
      where: {
        slug,
        status: { in: ["published", "active"] },
      },
    });
    return program;
  } catch (error) {
    console.error(`Failed to fetch program with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Admin function to fetch all programs with optional search and filters
 */
export async function getAdminPrograms(filters?: {
  query?: string;
  status?: string;
  category?: string;
}): Promise<ProgramRecord[]> {
  await requireAdmin();

  const where: any = {};

  if (filters?.query?.trim()) {
    const q = filters.query.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters?.category && filters.category !== "all") {
    where.category = filters.category;
  }

  return prisma.program.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Admin action to create a new program
 */
export async function createProgram(rawInput: unknown) {
  try {
    await requireAdmin();

    const parsed = programSchema.parse(rawInput);
    const finalSlug = await ensureUniqueSlug(parsed.slug || parsed.title);

    const program = await prisma.program.create({
      data: {
        title: parsed.title,
        slug: finalSlug,
        category: parsed.category,
        description: parsed.description,
        targetBeneficiaries: parsed.targetBeneficiaries,
        currentBeneficiaries: parsed.currentBeneficiaries,
        budget: parsed.budget ?? null,
        status: parsed.status,
        imageUrl: parsed.imageUrl ? parsed.imageUrl.trim() : null,
      },
    });

    revalidatePath("/admin/programs");
    revalidatePath("/programs");
    revalidatePath("/");

    return { success: true, program };
  } catch (error: any) {
    console.error("Create program failed:", error);
    return {
      success: false,
      error: error.message || "Failed to create program",
    };
  }
}

/**
 * Admin action to update an existing program
 */
export async function updateProgram(id: string, rawInput: unknown) {
  try {
    await requireAdmin();

    const existing = await prisma.program.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true },
    });

    if (!existing) {
      return { success: false, error: "Program not found" };
    }

    const parsed = programSchema.parse(rawInput);
    const baseSlug = parsed.slug || parsed.title;
    const finalSlug = await ensureUniqueSlug(baseSlug, id);

    const program = await prisma.program.update({
      where: { id },
      data: {
        title: parsed.title,
        slug: finalSlug,
        category: parsed.category,
        description: parsed.description,
        targetBeneficiaries: parsed.targetBeneficiaries,
        currentBeneficiaries: parsed.currentBeneficiaries,
        budget: parsed.budget ?? null,
        status: parsed.status,
        imageUrl: parsed.imageUrl ? parsed.imageUrl.trim() : null,
      },
    });

    revalidatePath("/admin/programs");
    revalidatePath("/programs");
    revalidatePath("/");

    return { success: true, program };
  } catch (error: any) {
    console.error("Update program failed:", error);
    return {
      success: false,
      error: error.message || "Failed to update program",
    };
  }
}

/**
 * Admin action to toggle between published and draft
 */
export async function toggleProgramPublish(id: string) {
  try {
    await requireAdmin();

    const existing = await prisma.program.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return { success: false, error: "Program not found" };
    }

    const nextStatus =
      existing.status === "published" || existing.status === "active"
        ? "draft"
        : "published";

    const updated = await prisma.program.update({
      where: { id },
      data: { status: nextStatus },
    });

    revalidatePath("/admin/programs");
    revalidatePath("/programs");
    revalidatePath("/");

    return { success: true, status: updated.status };
  } catch (error: any) {
    console.error("Toggle publish failed:", error);
    return {
      success: false,
      error: error.message || "Failed to toggle status",
    };
  }
}

/**
 * Admin action to set explicit status: draft, published, archived
 */
export async function setProgramStatus(id: string, status: ProgramStatus) {
  try {
    await requireAdmin();

    const validStatus = programStatusSchema.parse(status);

    const updated = await prisma.program.update({
      where: { id },
      data: { status: validStatus },
    });

    revalidatePath("/admin/programs");
    revalidatePath("/programs");
    revalidatePath("/");

    return { success: true, status: updated.status };
  } catch (error: any) {
    console.error("Set program status failed:", error);
    return {
      success: false,
      error: error.message || "Failed to set status",
    };
  }
}

/**
 * Admin action to delete a program
 */
export async function deleteProgram(id: string) {
  try {
    await requireAdmin();

    await prisma.program.delete({
      where: { id },
    });

    revalidatePath("/admin/programs");
    revalidatePath("/programs");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Delete program failed:", error);
    return {
      success: false,
      error: error.message || "Failed to delete program",
    };
  }
}
