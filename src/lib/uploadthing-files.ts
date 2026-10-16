import { UTApi } from "uploadthing/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export function uploadThingKey(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;

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

export async function lockUploadThingImageKeys(
  transaction: Prisma.TransactionClient,
  imageUrls: string[],
) {
  const keys = [
    ...new Set(imageUrls.map(uploadThingKey).filter((key): key is string => !!key)),
  ].sort();
  for (const key of keys) {
    await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))::text AS locked`;
  }
}

function parseProjectImages(images: string): string[] {
  try {
    const parsed: unknown = JSON.parse(images);
    return Array.isArray(parsed)
      ? parsed.filter((image): image is string => typeof image === "string")
      : [];
  } catch {
    return images ? [images] : [];
  }
}

export async function deleteUnreferencedUploadThingImages(
  imageUrls: string[],
  failureMessage = "The record was deleted, but one or more uploaded images could not be removed.",
) {
  const keys = [...new Set(imageUrls.map(uploadThingKey).filter((key): key is string => !!key))];
  if (keys.length === 0) return undefined;

  try {
    return await prisma.$transaction(async (transaction) => {
      await lockUploadThingImageKeys(transaction, imageUrls);
      const [programs, projects, galleryItems, impactStories, whoWeAre, teamProfiles] = await Promise.all([
        transaction.program.findMany({ select: { imageUrl: true } }),
        transaction.project.findMany({ select: { images: true } }),
        transaction.galleryItem.findMany({ select: { imageUrl: true } }),
        transaction.impactStory.findMany({ select: { imageUrl: true } }),
        transaction.whoWeAre.findMany({ select: { imageUrl: true } }),
        transaction.teamProfile.findMany({ select: { imageUrl: true } }),
      ]);
      const referencedKeys = new Set(
        [
          ...programs.map((item) => item.imageUrl),
          ...projects.flatMap((item) => parseProjectImages(item.images)),
          ...galleryItems.map((item) => item.imageUrl),
          ...impactStories.map((item) => item.imageUrl),
          ...whoWeAre.map((item) => item.imageUrl),
          ...teamProfiles.map((item) => item.imageUrl),
        ]
          .map(uploadThingKey)
          .filter((key): key is string => !!key),
      );
      const keysToDelete = keys.filter((key) => !referencedKeys.has(key));
      if (keysToDelete.length === 0) return undefined;

      const result = await new UTApi().deleteFiles(keysToDelete);
      if (!result.success) {
        console.error("UploadThing did not delete one or more unreferenced project images.");
        return failureMessage;
      }
      return undefined;
    }, { timeout: 30_000 });
  } catch (error) {
    console.error("Failed to delete unreferenced project images:", error);
    return failureMessage;
  }

  return undefined;
}
