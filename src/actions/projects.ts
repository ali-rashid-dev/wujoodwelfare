"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import {
  deleteUnreferencedUploadThingImages,
  lockUploadThingImageKeys,
} from "@/lib/uploadthing-files";
import {
  projectSchema,
  projectStatusSchema,
  type ProjectInput,
  type ProjectStatus,
} from "@/validation/project";

export type ProjectRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string; // JSON string of string[]
  status: string;
  published: boolean;
  publishedAt: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  programId: string | null;
  program: { id: string; title: string; slug: string } | null;
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
  let clean = slugify(baseSlug) || "project";
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? clean : `${clean}-${suffix}`;
    const existing = await prisma.project.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return candidate;
    }
    suffix++;
  }
}

const PROJECT_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  images: true,
  status: true,
  published: true,
  publishedAt: true,
  startDate: true,
  endDate: true,
  location: true,
  programId: true,
  program: { select: { id: true, title: true, slug: true } },
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Public: fetch only published projects
 */
export async function getPublishedProjects(): Promise<ProjectRecord[]> {
  try {
    const items = await prisma.project.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: PROJECT_SELECT,
    });
    return items as ProjectRecord[];
  } catch (error) {
    console.error("Failed to fetch published projects:", error);
    return [];
  }
}

/**
 * Public: fetch a single published project by slug
 */
export async function getPublishedProjectBySlug(slug: string): Promise<ProjectRecord | null> {
  try {
    const project = await prisma.project.findFirst({
      where: { slug, published: true },
      select: PROJECT_SELECT,
    });
    return project as ProjectRecord | null;
  } catch (error) {
    console.error(`Failed to fetch project with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Admin: fetch all projects with optional filters
 */
export async function getAdminProjects(filters?: {
  query?: string;
  status?: string;
  published?: string;
  programId?: string;
}): Promise<ProjectRecord[]> {
  await requireAdmin();

  const where: any = {};

  if (filters?.query?.trim()) {
    const q = filters.query.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters?.published === "true") {
    where.published = true;
  } else if (filters?.published === "false") {
    where.published = false;
  }

  if (filters?.programId && filters.programId !== "all") {
    where.programId = filters.programId;
  }

  const items = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: PROJECT_SELECT,
  });

  return items as ProjectRecord[];
}

/**
 * Admin: fetch a single project by id (for editing)
 */
export async function getAdminProjectById(id: string): Promise<ProjectRecord | null> {
  await requireAdmin();
  const project = await prisma.project.findUnique({
    where: { id },
    select: PROJECT_SELECT,
  });
  return project as ProjectRecord | null;
}

/**
 * Admin: create a new project
 */
export async function createProject(rawInput: unknown) {
  try {
    await requireAdmin();

    const parsed = projectSchema.parse(rawInput);
    const finalSlug = await ensureUniqueSlug(parsed.slug || parsed.title);

    const now = new Date();
    const publishedAt = parsed.published ? now : null;

    const project = await prisma.$transaction(async (transaction) => {
      await lockUploadThingImageKeys(transaction, parsed.images ?? []);
      return transaction.project.create({
        data: {
          title: parsed.title,
          slug: finalSlug,
          description: parsed.description,
          images: JSON.stringify(parsed.images ?? []),
          status: parsed.status,
          published: parsed.published,
          publishedAt,
          startDate: parsed.startDate ? new Date(parsed.startDate) : null,
          endDate: parsed.endDate ? new Date(parsed.endDate) : null,
          location: parsed.location?.trim() || null,
          programId: parsed.programId?.trim() || null,
        },
        select: PROJECT_SELECT,
      });
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");

    return { success: true, project };
  } catch (error: any) {
    console.error("Create project failed:", error);
    return {
      success: false,
      error: error.message || "Failed to create project",
    };
  }
}

/**
 * Admin: update an existing project
 */
export async function updateProject(id: string, rawInput: unknown) {
  try {
    await requireAdmin();

    const existing = await prisma.project.findUnique({
      where: { id },
      select: { id: true, slug: true, published: true, publishedAt: true },
    });

    if (!existing) {
      return { success: false, error: "Project not found" };
    }

    const parsed = projectSchema.parse(rawInput);
    const baseSlug = parsed.slug || parsed.title;
    const finalSlug = await ensureUniqueSlug(baseSlug, id);

    // Set publishedAt only when first publishing
    let publishedAt = existing.publishedAt;
    if (parsed.published && !existing.published) {
      publishedAt = new Date();
    } else if (!parsed.published) {
      publishedAt = null;
    }

    const project = await prisma.$transaction(async (transaction) => {
      await lockUploadThingImageKeys(transaction, parsed.images ?? []);
      return transaction.project.update({
        where: { id },
        data: {
          title: parsed.title,
          slug: finalSlug,
          description: parsed.description,
          images: JSON.stringify(parsed.images ?? []),
          status: parsed.status,
          published: parsed.published,
          publishedAt,
          startDate: parsed.startDate ? new Date(parsed.startDate) : null,
          endDate: parsed.endDate ? new Date(parsed.endDate) : null,
          location: parsed.location?.trim() || null,
          programId: parsed.programId?.trim() || null,
        },
        select: PROJECT_SELECT,
      });
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath(`/projects/${existing.slug}`);
    revalidatePath(`/projects/${finalSlug}`);
    revalidatePath("/");

    return { success: true, project };
  } catch (error: any) {
    console.error("Update project failed:", error);
    return {
      success: false,
      error: error.message || "Failed to update project",
    };
  }
}

/**
 * Admin: toggle publish/unpublish
 */
export async function toggleProjectPublish(id: string) {
  try {
    await requireAdmin();

    const existing = await prisma.project.findUnique({
      where: { id },
      select: { id: true, published: true, slug: true },
    });

    if (!existing) {
      return { success: false, error: "Project not found" };
    }

    const nextPublished = !existing.published;
    const publishedAt = nextPublished ? new Date() : null;

    const updated = await prisma.project.update({
      where: { id },
      data: { published: nextPublished, publishedAt },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath(`/projects/${existing.slug}`);
    revalidatePath("/");

    return { success: true, published: updated.published };
  } catch (error: any) {
    console.error("Toggle project publish failed:", error);
    return {
      success: false,
      error: error.message || "Failed to toggle publish status",
    };
  }
}

/**
 * Admin: set explicit project status
 */
export async function setProjectStatus(id: string, status: ProjectStatus) {
  try {
    await requireAdmin();

    const validStatus = projectStatusSchema.parse(status);

    const updated = await prisma.project.update({
      where: { id },
      data: { status: validStatus },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");

    return { success: true, status: updated.status };
  } catch (error: any) {
    console.error("Set project status failed:", error);
    return {
      success: false,
      error: error.message || "Failed to set status",
    };
  }
}

/**
 * Admin: delete a project
 */
export async function deleteProject(id: string) {
  try {
    await requireAdmin();

    const deletedProject = await prisma.project.delete({
      where: { id },
      select: { slug: true, images: true },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    if (deletedProject.slug) {
      revalidatePath(`/projects/${deletedProject.slug}`);
    }
    revalidatePath("/");

    let imageUrls: string[] = [];
    try {
      const parsed: unknown = JSON.parse(deletedProject.images);
      imageUrls = Array.isArray(parsed)
        ? parsed.filter((image): image is string => typeof image === "string")
        : [];
    } catch {
      if (deletedProject.images) imageUrls = [deletedProject.images];
    }
    const warning = await deleteUnreferencedUploadThingImages(imageUrls);
    return { success: true, warning };
  } catch (error: any) {
    console.error("Delete project failed:", error);
    return {
      success: false,
      error: error.message || "Failed to delete project",
    };
  }
}

/**
 * Public: list programs for the project form dropdown
 */
export async function getProgramsForSelect(): Promise<
  { id: string; title: string }[]
> {
  try {
    const programs = await prisma.program.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
    return programs;
  } catch {
    return [];
  }
}
