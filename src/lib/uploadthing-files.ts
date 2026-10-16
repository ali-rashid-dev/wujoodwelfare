import { UTApi } from "uploadthing/server";
import { prisma } from "@/lib/prisma";

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

export async function deleteUnreferencedUploadThingImages(imageUrls: string[]) {
  const keys = [...new Set(imageUrls.map(uploadThingKey).filter((key): key is string => !!key))];
  if (keys.length === 0) return undefined;

  try {
    const [programs, projects, galleryItems, impactStories, whoWeAre] = await Promise.all([
      prisma.program.findMany({ select: { imageUrl: true } }),
      prisma.project.findMany({ select: { images: true } }),
      prisma.galleryItem.findMany({ select: { imageUrl: true } }),
      prisma.impactStory.findMany({ select: { imageUrl: true } }),
      prisma.whoWeAre.findMany({ select: { imageUrl: true } }),
    ]);
    const referencedKeys = new Set(
      [
        ...programs.map((item) => item.imageUrl),
        ...projects.flatMap((item) => parseProjectImages(item.images)),
        ...galleryItems.map((item) => item.imageUrl),
        ...impactStories.map((item) => item.imageUrl),
        ...whoWeAre.map((item) => item.imageUrl),
      ]
        .map(uploadThingKey)
        .filter((key): key is string => !!key),
    );
    const keysToDelete = keys.filter((key) => !referencedKeys.has(key));
    if (keysToDelete.length === 0) return undefined;

    const result = await new UTApi().deleteFiles(keysToDelete);
    if (!result.success) {
      console.error("UploadThing did not delete one or more unreferenced project images.");
      return "The record was deleted, but one or more uploaded images could not be removed.";
    }
  } catch (error) {
    console.error("Failed to delete unreferenced project images:", error);
    return "The record was deleted, but one or more uploaded images could not be removed.";
  }

  return undefined;
}
