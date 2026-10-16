"use server";

import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { DEFAULT_WHO_WE_ARE } from "@/lib/who-we-are-defaults";

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

async function deleteOldImage(imageUrl: string) {
  const key = uploadThingKey(imageUrl);
  if (!key) return undefined;
  try {
    const result = await new UTApi().deleteFiles(key);
    if (!result.success) {
      console.error("UploadThing did not delete the previous Who We Are image.");
      return "Content was saved, but the previous uploaded image could not be removed.";
    }
  } catch (error) {
    console.error("Failed to delete previous Who We Are image:", error);
    return "Content was saved, but the previous uploaded image could not be removed.";
  }
  return undefined;
}

export async function updateWhoWeAre(rawInput: unknown) {
  try {
    await requireAdmin();
    const parsed = whoWeAreSchema.parse(rawInput);
    const existing = await prisma.whoWeAre.findUnique({
      where: { id: "main" },
      select: { imageUrl: true },
    });
    const content = await prisma.whoWeAre.upsert({
      where: { id: "main" },
      create: { id: "main", ...parsed },
      update: parsed,
      select: whoWeAreSelect,
    });
    revalidateWhoWeAre();

    const warning =
      existing && existing.imageUrl !== parsed.imageUrl
        ? await deleteOldImage(existing.imageUrl)
        : undefined;
    return { success: true as const, content, warning };
  } catch (error) {
    console.error("Update Who We Are content failed:", error);
    return {
      success: false as const,
      error: errorMessage(error, "Failed to save Who We Are content."),
    };
  }
}

export async function createWhoWeAreValue(rawInput: unknown) {
  try {
    await requireAdmin();
    const parsed = valueSchema.parse(rawInput);
    const value = await prisma.whoWeAreValue.create({
      data: parsed,
      select: valueSelect,
    });
    revalidateWhoWeAre();
    return { success: true as const, value };
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
