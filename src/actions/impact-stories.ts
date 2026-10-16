"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
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

const impactStorySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  role: z.string().trim().min(1, "Role or location is required.").max(180),
  text: z.string().trim().min(1, "Story text is required.").max(1500),
  imageUrl: imageUrlSchema,
  published: z.boolean(),
});

const impactStorySelect = {
  id: true,
  name: true,
  role: true,
  text: true,
  imageUrl: true,
  sortOrder: true,
  published: true,
  createdAt: true,
} as const;

export async function getPublishedImpactStories() {
  return prisma.impactStory.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      role: true,
      text: true,
      imageUrl: true,
    },
  });
}

export async function getAdminImpactStories() {
  await requireAdmin();
  return prisma.impactStory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: impactStorySelect,
  });
}

function revalidateImpactStories() {
  revalidatePath("/admin/stories");
  revalidatePath("/");
}

function validationError(error: unknown, fallback: string): string {
  return error instanceof z.ZodError ? error.issues[0]?.message ?? fallback : fallback;
}

export async function createImpactStory(rawInput: unknown) {
  try {
    await requireAdmin();
    const parsed = impactStorySchema.parse(rawInput);
    const latest = await prisma.impactStory.aggregate({ _max: { sortOrder: true } });
    const story = await prisma.$transaction(async (transaction) => {
      await lockUploadThingImageKeys(transaction, [parsed.imageUrl]);
      return transaction.impactStory.create({
        data: { ...parsed, sortOrder: (latest._max.sortOrder ?? -1) + 1 },
        select: impactStorySelect,
      });
    });
    revalidateImpactStories();
    return { success: true as const, story, warning: undefined };
  } catch (error) {
    console.error("Create impact story failed:", error);
    return {
      success: false as const,
      error: validationError(error, "Failed to create impact story."),
    };
  }
}

export async function updateImpactStory(id: string, rawInput: unknown) {
  try {
    await requireAdmin();
    const parsedId = z.string().trim().min(1).max(128).parse(id);
    const parsed = impactStorySchema.parse(rawInput);
    const existing = await prisma.impactStory.findUnique({
      where: { id: parsedId },
      select: { imageUrl: true },
    });
    if (!existing) return { success: false as const, error: "Impact story was not found." };

    const story = await prisma.$transaction(async (transaction) => {
      await lockUploadThingImageKeys(transaction, [parsed.imageUrl]);
      return transaction.impactStory.update({
        where: { id: parsedId },
        data: parsed,
        select: impactStorySelect,
      });
    });
    revalidateImpactStories();

    const warning =
      existing.imageUrl === parsed.imageUrl
        ? undefined
        : await deleteUnreferencedUploadThingImages(
            [existing.imageUrl],
            "The story was updated, but its previous uploaded image could not be removed.",
          );
    return { success: true as const, story, warning };
  } catch (error) {
    console.error("Update impact story failed:", error);
    return {
      success: false as const,
      error: validationError(error, "Failed to update impact story."),
    };
  }
}

export async function toggleImpactStoryPublish(id: string) {
  try {
    await requireAdmin();
    const parsedId = z.string().trim().min(1).max(128).parse(id);
    const existing = await prisma.impactStory.findUnique({
      where: { id: parsedId },
      select: { published: true },
    });
    if (!existing) return { success: false as const, error: "Impact story was not found." };

    const story = await prisma.impactStory.update({
      where: { id: parsedId },
      data: { published: !existing.published },
      select: { published: true },
    });
    revalidateImpactStories();
    return { success: true as const, published: story.published };
  } catch (error) {
    console.error("Toggle impact story publication failed:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to change publication status.",
    };
  }
}

export async function deleteImpactStory(id: string) {
  try {
    await requireAdmin();
    const parsedId = z.string().trim().min(1).max(128).parse(id);
    const existing = await prisma.impactStory.findUnique({
      where: { id: parsedId },
      select: { imageUrl: true },
    });
    if (!existing) return { success: false as const, error: "Impact story was not found." };

    const deletedStory = await prisma.impactStory.delete({
      where: { id: parsedId },
      select: { imageUrl: true },
    });
    revalidateImpactStories();
    const warning = await deleteUnreferencedUploadThingImages([deletedStory.imageUrl]);
    return { success: true as const, warning };
  } catch (error) {
    console.error("Delete impact story failed:", error);
    return {
      success: false as const,
      error: validationError(error, "Failed to delete impact story."),
    };
  }
}
