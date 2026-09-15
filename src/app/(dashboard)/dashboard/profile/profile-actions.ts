"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/auth-server";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function updateUserProfile(data: { name: string }) {
  try {
    const session = await requireServerSession();
    const validated = updateProfileSchema.parse(data);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validated.name,
      },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update profile";
    return { success: false, error: errorMsg };
  }
}
