import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getCurrentUser() {
  const session = await getServerSession();
  if (!session?.user) return null;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        banned: true,
      },
    });

    if (dbUser) {
      return {
        ...session.user,
        ...dbUser,
        role: dbUser.role || "volunteer",
      };
    }
  } catch (error) {
    console.error("Error fetching current user from DB:", error);
  }

  return {
    ...session.user,
    role: (session.user as any).role || "volunteer",
  };
}

export async function requireServerSession() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}