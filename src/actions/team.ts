"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { TEAM_SECTIONS } from "@/lib/team";
import {
  deleteUnreferencedUploadThingImages,
  lockUploadThingImageKeys,
} from "@/lib/uploadthing-files";

const imageUrlSchema = z.string().trim().min(1).max(2048).refine((value) => {
  if (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !value.includes("..")
  ) {
    return true;
  }

  try {
    const url = new URL(value);
    const uploadThingHost =
      url.hostname === "ufs.sh" ||
      url.hostname.endsWith(".ufs.sh") ||
      url.hostname === "utfs.io" ||
      url.hostname.endsWith(".utfs.io");
    return url.protocol === "https:" && uploadThingHost && url.pathname.startsWith("/f/");
  } catch {
    return false;
  }
}, "Choose an image uploaded through the image uploader.");

function socialUrlSchema(domains: string[]) {
  return z.string().trim().max(2048).optional().or(z.literal(""))
    .transform((value) => value || null)
    .refine((value) => {
      if (value === null) return true;
      try {
        const url = new URL(value);
        return url.protocol === "https:" &&
          !url.username &&
          !url.password &&
          domains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
      } catch {
        return false;
      }
    }, "Enter a valid HTTPS URL from an approved social platform.");
}

const teamProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  userId: z.string().trim().max(128).optional().or(z.literal(""))
    .transform((value) => value || null),
  designation: z.string().trim().min(1, "Designation is required.").max(160),
  categoryId: z.string().trim().min(1, "Choose a category.").max(128),
  biography: z.string().trim().min(1, "Biography is required.").max(2000),
  imageUrl: imageUrlSchema,
  department: z.string().trim().max(120).optional().or(z.literal(""))
    .transform((value) => value || null),
  linkedinUrl: socialUrlSchema(["linkedin.com"]),
  instagramUrl: socialUrlSchema(["instagram.com"]),
  facebookUrl: socialUrlSchema(["facebook.com", "fb.com"]),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000),
  featured: z.boolean(),
  published: z.boolean(),
});

const teamCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(120),
  section: z.enum(TEAM_SECTIONS),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000),
});

const categorySelect = {
  id: true,
  name: true,
  section: true,
  sortOrder: true,
} as const;

const adminProfileSelect = {
  id: true,
  userId: true,
  name: true,
  designation: true,
  biography: true,
  imageUrl: true,
  department: true,
  linkedinUrl: true,
  instagramUrl: true,
  facebookUrl: true,
  sortOrder: true,
  featured: true,
  published: true,
  category: { select: categorySelect },
  createdAt: true,
} as const;

export async function getPublishedTeamProfiles() {
  return prisma.teamProfile.findMany({
    where: { published: true },
    orderBy: [
      { category: { section: "asc" } },
      { category: { sortOrder: "asc" } },
      { category: { name: "asc" } },
      { featured: "desc" },
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      name: true,
      designation: true,
      biography: true,
      imageUrl: true,
      department: true,
      linkedinUrl: true,
      instagramUrl: true,
      facebookUrl: true,
      featured: true,
      category: { select: { section: true } },
    },
  });
}

export async function getAdminTeamManagementData() {
  await requireAdmin();
  const [profiles, categories, users] = await Promise.all([
    prisma.teamProfile.findMany({
      orderBy: [
        { category: { section: "asc" } },
        { category: { sortOrder: "asc" } },
        { category: { name: "asc" } },
        { featured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
      select: adminProfileSelect,
    }),
    prisma.teamCategory.findMany({
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: categorySelect,
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);
  return { profiles, categories, users };
}

function revalidateTeam() {
  revalidatePath("/admin/team");
  revalidatePath("/our-team");
}

function actionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? fallback;
  if (typeof error === "object" && error !== null && "code" in error) {
    if (error.code === "P2002") {
      return "This account already has a team profile, or a category with this name already exists in that section.";
    }
    if (error.code === "P2003") return "This category is in use and cannot be deleted.";
    if (error.code === "P2025") return "The requested team record was not found.";
    if (error.code === "P2028") return "The database is taking longer than expected. Please retry.";
  }
  return fallback;
}

export async function createTeamProfile(rawInput: unknown) {
  try {
    await requireAdmin();
    const parsed = teamProfileSchema.parse(rawInput);
    const category = await prisma.teamCategory.findUnique({
      where: { id: parsed.categoryId },
      select: { id: true },
    });
    if (!category) return { success: false as const, error: "Selected category was not found." };
    if (parsed.userId) {
      const user = await prisma.user.findUnique({
        where: { id: parsed.userId },
        select: { id: true },
      });
      if (!user) return { success: false as const, error: "Selected account was not found." };
    }

    const profile = await prisma.$transaction(async (transaction) => {
      await lockUploadThingImageKeys(transaction, [parsed.imageUrl]);
      return transaction.teamProfile.create({
        data: parsed,
        select: adminProfileSelect,
      });
    }, { maxWait: 30_000, timeout: 30_000 });
    revalidateTeam();
    return { success: true as const, profile };
  } catch (error) {
    console.error("Create team profile failed:", error);
    return {
      success: false as const,
      error: actionErrorMessage(error, "Failed to create team profile."),
    };
  }
}

export async function updateTeamProfile(id: string, rawInput: unknown) {
  try {
    await requireAdmin();
    const profileId = z.string().trim().min(1).max(128).parse(id);
    const parsed = teamProfileSchema.parse(rawInput);
    const existing = await prisma.teamProfile.findUnique({
      where: { id: profileId },
      select: { imageUrl: true },
    });
    if (!existing) return { success: false as const, error: "Team profile was not found." };

    const category = await prisma.teamCategory.findUnique({
      where: { id: parsed.categoryId },
      select: { id: true },
    });
    if (!category) return { success: false as const, error: "Selected category was not found." };
    if (parsed.userId) {
      const user = await prisma.user.findUnique({
        where: { id: parsed.userId },
        select: { id: true },
      });
      if (!user) return { success: false as const, error: "Selected account was not found." };
    }

    const profile = await prisma.$transaction(async (transaction) => {
      await lockUploadThingImageKeys(transaction, [parsed.imageUrl]);
      return transaction.teamProfile.update({
        where: { id: profileId },
        data: parsed,
        select: adminProfileSelect,
      });
    }, { maxWait: 30_000, timeout: 30_000 });
    revalidateTeam();

    const warning = existing.imageUrl === parsed.imageUrl
      ? undefined
      : await deleteUnreferencedUploadThingImages(
          [existing.imageUrl],
          "The profile was updated, but its previous uploaded image could not be removed.",
        );
    return { success: true as const, profile, warning };
  } catch (error) {
    console.error("Update team profile failed:", error);
    return {
      success: false as const,
      error: actionErrorMessage(error, "Failed to update team profile."),
    };
  }
}

export async function toggleTeamProfilePublish(id: string) {
  try {
    await requireAdmin();
    const profileId = z.string().trim().min(1).max(128).parse(id);
    const existing = await prisma.teamProfile.findUnique({
      where: { id: profileId },
      select: { published: true },
    });
    if (!existing) return { success: false as const, error: "Team profile was not found." };

    const profile = await prisma.teamProfile.update({
      where: { id: profileId },
      data: { published: !existing.published },
      select: { published: true },
    });
    revalidateTeam();
    return { success: true as const, published: profile.published };
  } catch (error) {
    console.error("Toggle team profile publication failed:", error);
    return {
      success: false as const,
      error: actionErrorMessage(error, "Failed to change publication status."),
    };
  }
}

export async function deleteTeamProfile(id: string) {
  try {
    await requireAdmin();
    const profileId = z.string().trim().min(1).max(128).parse(id);
    const profile = await prisma.teamProfile.delete({
      where: { id: profileId },
      select: { imageUrl: true, name: true },
    });
    revalidateTeam();
    const warning = await deleteUnreferencedUploadThingImages([profile.imageUrl]);
    return { success: true as const, name: profile.name, warning };
  } catch (error) {
    console.error("Delete team profile failed:", error);
    return {
      success: false as const,
      error: actionErrorMessage(error, "Failed to delete team profile."),
    };
  }
}

export async function createTeamCategory(rawInput: unknown) {
  try {
    await requireAdmin();
    const parsed = teamCategorySchema.parse(rawInput);
    const category = await prisma.teamCategory.create({
      data: parsed,
      select: categorySelect,
    });
    revalidateTeam();
    return { success: true as const, category };
  } catch (error) {
    console.error("Create team category failed:", error);
    return {
      success: false as const,
      error: actionErrorMessage(error, "Failed to create team category."),
    };
  }
}

export async function updateTeamCategory(id: string, rawInput: unknown) {
  try {
    await requireAdmin();
    const categoryId = z.string().trim().min(1).max(128).parse(id);
    const parsed = teamCategorySchema.parse(rawInput);
    const category = await prisma.teamCategory.update({
      where: { id: categoryId },
      data: parsed,
      select: categorySelect,
    });
    revalidateTeam();
    return { success: true as const, category };
  } catch (error) {
    console.error("Update team category failed:", error);
    return {
      success: false as const,
      error: actionErrorMessage(error, "Failed to update team category."),
    };
  }
}

export async function deleteTeamCategory(id: string) {
  try {
    await requireAdmin();
    const categoryId = z.string().trim().min(1).max(128).parse(id);
    const profileCount = await prisma.teamProfile.count({ where: { categoryId } });
    if (profileCount > 0) {
      return {
        success: false as const,
        error: "Reassign or delete this category's profiles before deleting the category.",
      };
    }
    await prisma.teamCategory.delete({ where: { id: categoryId } });
    revalidateTeam();
    return { success: true as const };
  } catch (error) {
    console.error("Delete team category failed:", error);
    return {
      success: false as const,
      error: actionErrorMessage(error, "Failed to delete team category."),
    };
  }
}
