"use server";

import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { DEFAULT_WHO_WE_ARE } from "@/lib/who-we-are-defaults";
import {
  deleteUnreferencedUploadThingImages,
  lockUploadThingImageKeys,
  uploadThingKey,
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

const whoWeAreSchema = z.object({
  heading: z.string().trim().min(1, "Heading is required.").max(160),
  description: z.string().trim().min(1, "Description is required.").max(2000),
  imageUrl: imageUrlSchema,
  yearsExperience: z.number().int().min(1).max(200),
});

const updateWhoWeAreSchema = whoWeAreSchema.extend({
  expectedImageUrl: imageUrlSchema,
});

const valueSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(80),
  text: z.string().trim().min(1, "Description is required.").max(600),
  icon: z.enum(["target", "eye", "sparkles", "heart", "hand-heart", "shield-check"]),
  sortOrder: z.number().int().min(0).max(99),
});

const whoWeAreSelect = {
  id: true,
  heading: true,
  description: true,
  imageUrl: true,
  yearsExperience: true,
} as const;

const valueSelect = {
  id: true,
  title: true,
  text: true,
  icon: true,
  sortOrder: true,
} as const;

const MAX_WHO_WE_ARE_VALUES = 3;

export async function getPublicWhoWeAre() {
  const [content, values] = await Promise.all([
    prisma.whoWeAre.findUnique({ where: { id: "main" }, select: whoWeAreSelect }),
    prisma.whoWeAreValue.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: valueSelect,
    }),
  ]);

  return {
    content: content ?? DEFAULT_WHO_WE_ARE,
    values,
  };
}

export async function getAdminWhoWeAre() {
  await requireAdmin();
  const [content, values] = await Promise.all([
    prisma.whoWeAre.findUnique({ where: { id: "main" }, select: whoWeAreSelect }),
    prisma.whoWeAreValue.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: valueSelect,
    }),
  ]);

  return {
    content: content ?? DEFAULT_WHO_WE_ARE,
    values,
  };
}

function revalidateWhoWeAre() {
  revalidatePath("/admin/who-we-are");
  revalidatePath("/");
  revalidatePath("/about");
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof z.ZodError ? error.issues[0]?.message ?? fallback : fallback;
}

async function deleteOldImage(imageUrl: string) {
  return deleteUnreferencedUploadThingImages(
    [imageUrl],
    "Content was saved, but the previous uploaded image could not be removed.",
  );
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function updateWhoWeAre(rawInput: unknown) {
  try {
    const admin = await requireAdmin();
    const parsed = updateWhoWeAreSchema.parse(rawInput);
    const { expectedImageUrl, ...data } = parsed;
    const replacementKey =
      data.imageUrl !== expectedImageUrl ? uploadThingKey(data.imageUrl) : null;
    let saveResult;
    try {
      saveResult = await prisma.$transaction(async (transaction) => {
        await lockUploadThingImageKeys(transaction, [data.imageUrl]);
        if (replacementKey) {
          const pendingUpload = await transaction.whoWeArePendingUpload.findFirst({
            where: { fileKey: replacementKey, uploadedBy: admin.id },
            select: { fileKey: true },
          });
          if (!pendingUpload) return { content: null, conflict: false, invalidUpload: true };
        }

        const [updatedContent] = await transaction.whoWeAre.updateManyAndReturn({
          where: { id: "main", imageUrl: expectedImageUrl },
          data,
          select: whoWeAreSelect,
        });
        if (updatedContent) {
          if (replacementKey) {
            const deleted = await transaction.whoWeArePendingUpload.deleteMany({
              where: { fileKey: replacementKey, uploadedBy: admin.id },
            });
            if (deleted.count !== 1) {
              throw new Error("Pending Who We Are upload changed during save.");
            }
          }
          return { content: updatedContent, conflict: false, invalidUpload: false };
        }

        const existingContent = await transaction.whoWeAre.findUnique({
          where: { id: "main" },
          select: { id: true },
        });
        if (existingContent) return { content: null, conflict: true, invalidUpload: false };

        const createdContent = await transaction.whoWeAre.create({
          data: { id: "main", ...data },
          select: whoWeAreSelect,
        });
        if (replacementKey) {
          const deleted = await transaction.whoWeArePendingUpload.deleteMany({
            where: { fileKey: replacementKey, uploadedBy: admin.id },
          });
          if (deleted.count !== 1) {
            throw new Error("Pending Who We Are upload changed during save.");
          }
        }
        return { content: createdContent, conflict: false, invalidUpload: false };
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return {
          success: false as const,
          error: "Who We Are content changed since you opened it. Refresh and try again.",
        };
      }
      throw error;
    }

    if (saveResult.invalidUpload) {
      return {
        success: false as const,
        error: "Upload a replacement image through the Who We Are form before saving.",
      };
    }
    if (!saveResult.content) {
      return {
        success: false as const,
        error: "Who We Are content changed since you opened it. Refresh and try again.",
      };
    }
    revalidateWhoWeAre();

    const warning =
      expectedImageUrl !== data.imageUrl
        ? await deleteOldImage(expectedImageUrl)
        : undefined;
    return { success: true as const, content: saveResult.content, warning };
  } catch (error) {
    console.error("Update Who We Are content failed:", error);
    return {
      success: false as const,
      error: errorMessage(error, "Failed to save Who We Are content."),
    };
  }
}

export async function discardWhoWeAreImageUpload(rawImageUrl: unknown) {
  try {
    const admin = await requireAdmin();
    const imageUrl = imageUrlSchema.parse(rawImageUrl);
    const key = uploadThingKey(imageUrl);
    if (!key) return { success: true as const };

    try {
      const discarded = await prisma.$transaction(async (transaction) => {
        await lockUploadThingImageKeys(transaction, [imageUrl]);
        const publishedImage = await transaction.whoWeAre.findUnique({
          where: { id: "main" },
          select: { imageUrl: true },
        });
        if (publishedImage && uploadThingKey(publishedImage.imageUrl) === key) {
          return "published" as const;
        }

        const pendingUpload = await transaction.whoWeArePendingUpload.deleteMany({
          where: { fileKey: key, uploadedBy: admin.id },
        });
        if (pendingUpload.count !== 1) return "not-pending" as const;

        const result = await new UTApi().deleteFiles(key);
        if (!result.success) throw new Error("UploadThing did not delete the pending image.");
        return "deleted" as const;
      });
      if (discarded === "published") {
        return {
          success: false as const,
          error: "The currently published Who We Are image cannot be discarded.",
        };
      }
      if (discarded === "not-pending") {
        return {
          success: false as const,
          error: "Only a pending upload from this Who We Are form can be discarded.",
        };
      }
      return { success: true as const };
    } catch (error) {
      console.error("Failed to delete a cancelled Who We Are image upload:", error);
      await prisma.whoWeArePendingUpload.upsert({
        where: { fileKey: key },
        create: { fileKey: key, uploadedBy: admin.id },
        update: { uploadedBy: admin.id },
      });
      return {
        success: false as const,
        error: "The replacement was cancelled, but its uploaded image could not be removed.",
      };
    }
  } catch (error) {
    console.error("Discard cancelled Who We Are image upload failed:", error);
    return {
      success: false as const,
      error: errorMessage(error, "Could not remove the cancelled image upload."),
    };
  }
}

export async function createWhoWeAreValue(rawInput: unknown) {
  try {
    await requireAdmin();
    const parsed = valueSchema.parse(rawInput);
    const result = await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT pg_advisory_xact_lock(8675309)`;
      const count = await transaction.whoWeAreValue.count();
      if (count >= MAX_WHO_WE_ARE_VALUES) return null;

      return transaction.whoWeAreValue.create({
        data: parsed,
        select: valueSelect,
      });
    });
    if (!result) {
      return {
        success: false as const,
        error: "You can add up to three Who We Are value cards.",
      };
    }

    revalidateWhoWeAre();
    return { success: true as const, value: result };
  } catch (error) {
    console.error("Create Who We Are value failed:", error);
    return {
      success: false as const,
      error: errorMessage(error, "Failed to create content card."),
    };
  }
}

export async function updateWhoWeAreValue(id: string, rawInput: unknown) {
  try {
    await requireAdmin();
    const parsedId = z.string().trim().min(1).max(128).parse(id);
    const parsed = valueSchema.parse(rawInput);
    const value = await prisma.whoWeAreValue.update({
      where: { id: parsedId },
      data: parsed,
      select: valueSelect,
    });
    revalidateWhoWeAre();
    return { success: true as const, value };
  } catch (error) {
    console.error("Update Who We Are value failed:", error);
    return {
      success: false as const,
      error: errorMessage(error, "Failed to update content card."),
    };
  }
}

export async function deleteWhoWeAreValue(id: string) {
  try {
    await requireAdmin();
    const parsedId = z.string().trim().min(1).max(128).parse(id);
    await prisma.whoWeAreValue.delete({ where: { id: parsedId } });
    revalidateWhoWeAre();
    return { success: true as const };
  } catch (error) {
    console.error("Delete Who We Are value failed:", error);
    return {
      success: false as const,
      error: errorMessage(error, "Failed to delete content card."),
    };
  }
}
