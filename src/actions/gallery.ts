"use server";

import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";

const galleryImageUrlSchema = z.string().min(1).max(2048).refine((value) => {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !value.includes("..")) {
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

const galleryItemSchema = z.object({
  title: z.string().trim().min(1, "Caption is required.").max(180),
  category: z.string().trim().min(1, "Category is required.").max(80),
  description: z.string().trim().max(1000).nullable(),
  projectId: z.string().trim().nullable(),
  published: z.boolean(),
});

const galleryItemSelect = {
  id: true,
  title: true,
  category: true,
  imageUrl: true,
  description: true,
  published: true,
  projectId: true,
  project: { select: { id: true, title: true, slug: true } },
  createdAt: true,
} as const;

export type GalleryItemRecord = Awaited<
  ReturnType<typeof getAdminGalleryItems>
>[number];

export async function getPublishedGalleryItems() {
  return prisma.galleryItem.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      imageUrl: true,
      description: true,
    },
  });
}

export async function getAdminGalleryItems() {
  await requireAdmin();
  return prisma.galleryItem.findMany({
    orderBy: { createdAt: "desc" },
    select: galleryItemSelect,
  });
}

export async function getGalleryProjects() {
  await requireAdmin();
  return prisma.project.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
}

function revalidateGallery() {
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
}

function galleryActionErrorMessage(error: unknown, fallback: string): string {
  return error instanceof z.ZodError ? error.issues[0]?.message ?? fallback : fallback;
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

export async function createGalleryItem(rawInput: unknown) {
  try {
    await requireAdmin();
    const parsed = galleryItemSchema.extend({ imageUrl: galleryImageUrlSchema }).parse(rawInput);

    if (parsed.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: parsed.projectId },
        select: { id: true },
      });
      if (!project) return { success: false, error: "Selected project was not found." };
    }

    const item = await prisma.galleryItem.create({
      data: {
        title: parsed.title,
        category: parsed.category,
        imageUrl: parsed.imageUrl,
        description: parsed.description || null,
        published: parsed.published,
        projectId: parsed.projectId || null,
      },
      select: galleryItemSelect,
    });

    revalidateGallery();
    return { success: true, item };
  } catch (error) {
    console.error("Create gallery item failed:", error);
    return {
      success: false,
      error: galleryActionErrorMessage(error, "Failed to create gallery item."),
    };
  }
}

export async function updateGalleryItem(id: string, rawInput: unknown) {
  try {
    await requireAdmin();
    const parsed = galleryItemSchema.parse(rawInput);

    if (parsed.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: parsed.projectId },
        select: { id: true },
      });
      if (!project) return { success: false, error: "Selected project was not found." };
    }

    const item = await prisma.galleryItem.update({
      where: { id },
      data: {
        title: parsed.title,
        category: parsed.category,
        description: parsed.description || null,
        published: parsed.published,
        projectId: parsed.projectId || null,
      },
      select: galleryItemSelect,
    });

    revalidateGallery();
    return { success: true, item };
  } catch (error) {
    console.error("Update gallery item failed:", error);
    return {
      success: false,
      error: galleryActionErrorMessage(error, "Failed to update gallery item."),
    };
  }
}

export async function toggleGalleryItemPublish(id: string) {
  try {
    await requireAdmin();
    const existing = await prisma.galleryItem.findUnique({
      where: { id },
      select: { published: true },
    });
    if (!existing) return { success: false, error: "Gallery image was not found." };

    const item = await prisma.galleryItem.update({
      where: { id },
      data: { published: !existing.published },
      select: { published: true },
    });

    revalidateGallery();
    return { success: true, published: item.published };
  } catch (error) {
    console.error("Toggle gallery publication failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change publication status.",
    };
  }
}

export async function deleteGalleryItem(id: string) {
  try {
    await requireAdmin();
    const existing = await prisma.galleryItem.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!existing) return { success: false, error: "Gallery image was not found." };

    await prisma.galleryItem.delete({ where: { id } });
    revalidateGallery();

    const key = uploadThingKey(existing.imageUrl);
    if (!key) return { success: true };

    try {
      const result = await new UTApi().deleteFiles(key);
      if (!result.success) {
        console.error(`UploadThing did not delete gallery image ${id}.`);
        return {
          success: true,
          warning: "The gallery entry was deleted, but its stored image could not be removed.",
        };
      }
    } catch (error) {
      console.error(`Failed to delete stored gallery image ${id}:`, error);
      return {
        success: true,
        warning: "The gallery entry was deleted, but its stored image could not be removed.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete gallery item failed:", error);
    return {
      success: false,
      error: galleryActionErrorMessage(error, "Failed to delete gallery image."),
    };
  }
}
