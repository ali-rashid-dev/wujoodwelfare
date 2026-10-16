import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function requireApprovedVolunteer() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      banned: true,
    },
  });

  if (!user || user.role !== "volunteer" || user.banned) {
    throw new Error("Forbidden: Approved volunteer access required");
  }

  const approvedApplication = await prisma.volunteerApplication.findFirst({
    where: {
      status: "approved",
      OR: [
        { userId: user.id },
        ...(user.emailVerified
          ? [{ userId: null, email: { equals: user.email, mode: "insensitive" as const } }]
          : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      skills: true,
    },
  });

  if (!approvedApplication) {
    throw new Error("Forbidden: Approved volunteer access required");
  }

  return {
    ...user,
    name: approvedApplication.name,
    volunteerApplication: approvedApplication,
  };
}
