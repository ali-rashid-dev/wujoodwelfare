"use server";

import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";

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

function uploadThingKey(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const uploadThingHost =
      url.hostname === "ufs.sh" ||
      url.hostname.endsWith(".ufs.sh") ||
      url.hostname === "utfs.io" ||
      url.hostname.endsWith(".utfs.io");
    if (url.protocol !== "https:" || !uploadThingHost || !url.pathname.startsWith("/f/")) {
      return null;
    }
    return url.pathname.slice("/f/".length);
  } catch {
    return null;
  }
}

function validationError(error: unknown, fallback: string): string {
  return error instanceof z.ZodError ? error.issues[0]?.message ?? fallback : fallback;
}

async function deleteUploadedImage(
  imageUrl: string,
  storyId: string,
  failureMessage: string,
) {
  const key = uploadThingKey(imageUrl);
  if (!key) return undefined;

  try {
    const result = await new UTApi().deleteFiles(key);
    if (!result.success) {
      console.error(`UploadThing did not delete impact story image ${storyId}.`);
      return failureMessage;
    }
  } catch (error) {
    console.error(`Failed to delete uploaded impact story image ${storyId}:`, error);
    return failureMessage;
  }
  return undefined;
}

export async function createImpactStory(rawInput: unknown) {
  try {
    await requireAdmin();
    const parsed = impactStorySchema.parse(rawInput);
    const latest = await prisma.impactStory.aggregate({ _max: { sortOrder: true } });
    const story = await prisma.impactStory.create({
      data: { ...parsed, sortOrder: (latest._max.sortOrder ?? -1) + 1 },
      select: impactStorySelect,
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

    const story = await prisma.impactStory.update({
      where: { id: parsedId },
      data: parsed,
      select: impactStorySelect,
    });
    revalidateImpactStories();

    const warning =
      existing.imageUrl === parsed.imageUrl
        ? undefined
        : await deleteUploadedImage(
            existing.imageUrl,
            parsedId,
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

    await prisma.impactStory.delete({ where: { id: parsedId } });
    revalidateImpactStories();
    const warning = await deleteUploadedImage(
      existing.imageUrl,
      parsedId,
      "The story was deleted, but its uploaded image could not be removed.",
    );
    return { success: true as const, warning };
  } catch (error) {
    console.error("Delete impact story failed:", error);
    return {
      success: false as const,
      error: validationError(error, "Failed to delete impact story."),
    };
  }
}
