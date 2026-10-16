"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

const userIdSchema = z.string().trim().min(1).max(128);
const roleSchema = z.enum(["admin", "volunteer"]);
const accountStatusSchema = z.enum(["active", "deactivated"]);

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).toLowerCase(),
  password: z.string().min(12).max(128),
});

const profileSchema = z.object({
  userId: userIdSchema,
  name: z.string().trim().min(2).max(100),
  image: z
    .string()
    .trim()
    .max(2048)
    .refine((value) => {
      if (!value) return true;
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, "Enter a valid HTTP or HTTPS image URL.")
    .optional(),
});

const userPageSchema = z.object({
  query: z.string().trim().max(100).catch("").default(""),
  role: z.union([z.literal("all"), roleSchema]).catch("all").default("all"),
  status: z.union([z.literal("all"), accountStatusSchema]).catch("all").default("all"),
  page: z.coerce.number().int().min(1).max(1_000_000).catch(1).default(1),
}).catch({ query: "", role: "all", status: "all", page: 1 });

const pageSize = 10;

function activeAccountWhere(now: Date): Prisma.UserWhereInput {
  return {
    OR: [
      { banned: false },
      { banned: null },
      { banned: true, banExpires: { lte: now } },
    ],
  };
}

function deactivatedAccountWhere(now: Date): Prisma.UserWhereInput {
  return {
    banned: true,
    OR: [{ banExpires: null }, { banExpires: { gt: now } }],
  };
}

function isActiveAccount(
  user: { banned: boolean | null; banExpires: Date | null },
  now: Date,
) {
  return user.banned !== true || (user.banExpires !== null && user.banExpires <= now);
}

function revalidateUserManagement() {
  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/approved-volunteers");
  revalidatePath("/volunteer/dashboard");
  revalidatePath("/volunteer/status");
}

export async function getAdminUserManagement(rawFilters: unknown) {
  await requireAdmin();
  const filters = userPageSchema.parse(rawFilters);
  const now = new Date();

  const conditions: Prisma.UserWhereInput[] = [];
  if (filters.query) {
    conditions.push({
      OR: [
        { name: { contains: filters.query, mode: "insensitive" } },
        { email: { contains: filters.query, mode: "insensitive" } },
      ],
    });
  }
  if (filters.role !== "all") conditions.push({ role: filters.role });
  if (filters.status === "active") conditions.push(activeAccountWhere(now));
  if (filters.status === "deactivated") conditions.push(deactivatedAccountWhere(now));

  const where: Prisma.UserWhereInput = conditions.length
    ? { AND: conditions }
    : {};

  const [total, totalUsers, activeUsers, deactivatedUsers, admins, volunteers] =
    await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count(),
      prisma.user.count({ where: activeAccountWhere(now) }),
      prisma.user.count({ where: deactivatedAccountWhere(now) }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { role: "volunteer" } }),
    ]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(filters.page, pageCount);
  const users = await prisma.user.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      banned: true,
      banExpires: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { assignments: true } },
    },
  });

  return {
    users: users.map((user) => ({
      ...user,
      accountStatus: isActiveAccount(user, now) ? "active" as const : "deactivated" as const,
    })),
    filters: {
      query: filters.query,
      role: filters.role,
      status: filters.status,
    },
    pagination: { page, pageCount, pageSize, total },
    stats: { totalUsers, activeUsers, deactivatedUsers, admins, volunteers },
  };
}

export async function createManagedUser(rawInput: unknown) {
  await requireAdmin();
  const validation = createUserSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: "Enter a valid name, email, and password of at least 12 characters." };
  }

  const requestHeaders = await headers();
  try {
    const created = await auth.api.createUser({
      body: {
        name: validation.data.name,
        email: validation.data.email,
        password: validation.data.password,
      },
      headers: requestHeaders,
    });

    let verificationEmailSent = false;
    try {
      const verification = await auth.api.sendVerificationEmail({
        body: { email: validation.data.email, callbackURL: "/sign-in" },
        headers: requestHeaders,
      });
      verificationEmailSent = verification.status;
      if (!verificationEmailSent) {
        console.error("Verification email was not sent for newly created user:", created.user.id);
      }
    } catch (error) {
      console.error("New user verification email failed:", error);
    }

    revalidateUserManagement();
    return { success: true as const, verificationEmailSent };
  } catch (error) {
    console.error("Administrative user creation failed:", error);
    return {
      success: false as const,
      error: "Could not create this account. Check that the email is not already in use.",
    };
  }
}

export async function updateManagedUserProfile(rawInput: unknown) {
  const admin = await requireAdmin();
  const validation = profileSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: "Enter a valid name and image URL." };
  }

  try {
    await prisma.user.update({
      where: { id: validation.data.userId },
      data: {
        name: validation.data.name,
        image: validation.data.image || null,
      },
      select: { id: true },
    });
    revalidateUserManagement();
    return { success: true as const };
  } catch (error) {
    console.error(`Profile update by admin ${admin.id} failed:`, error);
    return { success: false as const, error: "Could not update this user profile." };
  }
}

export async function changeManagedUserRole(rawUserId: unknown, rawRole: unknown) {
  const admin = await requireAdmin();
  const idResult = userIdSchema.safeParse(rawUserId);
  const roleResult = roleSchema.safeParse(rawRole);
  if (!idResult.success || !roleResult.success) {
    return { success: false as const, error: "Choose a valid user and role." };
  }
  if (idResult.data === admin.id) {
    return { success: false as const, error: "You cannot change your own role." };
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: idResult.data },
          select: { id: true, role: true, banned: true, banExpires: true },
        });
        if (!user) return "not_found" as const;
        if (user.role === roleResult.data) return "unchanged" as const;

        if (
          user.role === "admin" &&
          roleResult.data !== "admin" &&
          isActiveAccount(user, new Date())
        ) {
          const activeAdmins = await tx.user.count({
            where: { role: "admin", ...activeAccountWhere(new Date()) },
          });
          if (activeAdmins <= 1) return "last_admin" as const;
        }

        await tx.user.update({
          where: { id: user.id },
          data: { role: roleResult.data },
        });
        await tx.session.deleteMany({ where: { userId: user.id } });
        return "updated" as const;
      },
      { isolationLevel: "Serializable" },
    );

    if (result === "not_found") return { success: false as const, error: "User not found." };
    if (result === "last_admin") {
      return { success: false as const, error: "The last active administrator cannot be demoted." };
    }
    revalidateUserManagement();
    return { success: true as const, changed: result === "updated" };
  } catch (error) {
    console.error(`Role change by admin ${admin.id} failed:`, error);
    return { success: false as const, error: "Could not change this user's role." };
  }
}

export async function changeManagedUserStatus(
  rawUserId: unknown,
  rawStatus: unknown,
) {
  const admin = await requireAdmin();
  const idResult = userIdSchema.safeParse(rawUserId);
  const statusResult = accountStatusSchema.safeParse(rawStatus);
  if (!idResult.success || !statusResult.success) {
    return { success: false as const, error: "Choose a valid user and account status." };
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const now = new Date();
        const user = await tx.user.findUnique({
          where: { id: idResult.data },
          select: { id: true, role: true, banned: true, banExpires: true },
        });
        if (!user) return "not_found" as const;

        const currentlyActive = isActiveAccount(user, now);
        const shouldBeActive = statusResult.data === "active";
        if (currentlyActive === shouldBeActive) return "unchanged" as const;

        if (!shouldBeActive && user.role === "admin") {
          const activeAdmins = await tx.user.count({
            where: { role: "admin", ...activeAccountWhere(now) },
          });
          if (activeAdmins <= 1) return "last_admin" as const;
        }

        await tx.user.update({
          where: { id: user.id },
          data: shouldBeActive
            ? { banned: false, banReason: null, banExpires: null }
            : {
                banned: true,
                banReason: "Deactivated by an administrator",
                banExpires: null,
              },
        });
        await tx.session.deleteMany({ where: { userId: user.id } });
        return "updated" as const;
      },
      { isolationLevel: "Serializable" },
    );

    if (result === "not_found") return { success: false as const, error: "User not found." };
    if (result === "last_admin") {
      return { success: false as const, error: "The last active administrator cannot be deactivated." };
    }
    revalidateUserManagement();
    return { success: true as const, changed: result === "updated" };
  } catch (error) {
    console.error(`Account status change by admin ${admin.id} failed:`, error);
    return { success: false as const, error: "Could not change this user's account status." };
  }
}
