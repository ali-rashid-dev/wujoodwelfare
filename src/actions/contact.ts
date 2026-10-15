"use server";

import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import {
  contactFormSchema,
  contactMessageStatusSchema,
  type ContactFormField,
  type ContactSubmissionState,
} from "@/validation";

const contactMessageSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  subject: true,
  message: true,
  status: true,
  createdAt: true,
} as const;

const contactMessageIdSchema = z.string().trim().min(1).max(128);

function getContactFormData(formData: FormData) {
  const getText = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  return {
    name: getText("name"),
    email: getText("email"),
    phone: getText("phone"),
    subject: getText("subject"),
    message: getText("message"),
  };
}

function getClientAddress(requestHeaders: Headers): string {
  const forwardedAddresses = requestHeaders.get("x-forwarded-for")?.split(",");
  const address = forwardedAddresses?.at(-1)?.trim();
  if (!address || isIP(address) === 0) {
    throw new Error("Unable to determine the visitor IP address from the trusted proxy headers.");
  }
  return address;
}

async function consumeContactRateLimit(address: string): Promise<boolean> {
  const secret =
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("A server secret is required to protect contact submissions.");
  }

  const addressHash = createHmac("sha256", secret).update(address).digest("hex");
  await prisma.contactRateLimit.deleteMany({
    where: { windowStartedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });

  const [rateLimit] = await prisma.$queryRaw<{ requestCount: number }[]>`
    INSERT INTO "contact_rate_limit" ("key", "windowStartedAt", "requests")
    VALUES (${addressHash}, NOW(), 1)
    ON CONFLICT ("key") DO UPDATE
    SET "requests" = CASE
          WHEN "contact_rate_limit"."windowStartedAt" <= NOW() - INTERVAL '15 minutes' THEN 1
          ELSE "contact_rate_limit"."requests" + 1
        END,
        "windowStartedAt" = CASE
          WHEN "contact_rate_limit"."windowStartedAt" <= NOW() - INTERVAL '15 minutes' THEN NOW()
          ELSE "contact_rate_limit"."windowStartedAt"
        END
    RETURNING "requests" AS "requestCount"
  `;

  return rateLimit.requestCount <= 5;
}

export async function submitContactMessage(
  _previousState: ContactSubmissionState,
  formData: FormData,
): Promise<ContactSubmissionState> {
  if (typeof formData.get("website") === "string" && formData.get("website")) {
    return {
      status: "success",
      message: "Thank you for contacting us. We'll be in touch soon.",
      fieldErrors: {},
      fieldValues: { name: "", email: "", phone: "", subject: "", message: "" },
    };
  }

  try {
    const requestHeaders = await headers();
    const allowed = await consumeContactRateLimit(getClientAddress(requestHeaders));
    if (!allowed) {
      return {
        status: "error",
        message: "Too many messages were submitted. Please try again in 15 minutes.",
        fieldErrors: {},
        fieldValues: getContactFormData(formData),
      };
    }
  } catch (error) {
    console.error("Contact form rate limit failed:", error);
    return {
      status: "error",
      message: "We couldn't send your message right now. Please try again later.",
      fieldErrors: {},
      fieldValues: getContactFormData(formData),
    };
  }

  const validation = contactFormSchema.safeParse(getContactFormData(formData));
  if (!validation.success) {
    const fieldErrors: Partial<Record<ContactFormField, string>> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0];
      if (
        (field === "name" || field === "email" || field === "phone" || field === "subject" || field === "message") &&
        !fieldErrors[field]
      ) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
      fieldValues: getContactFormData(formData),
    };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        ...validation.data,
        phone: validation.data.phone || null,
      },
      select: { id: true },
    });
  } catch (error) {
    console.error("Contact message submission failed:", error);
    return {
      status: "error",
      message: "We couldn't send your message right now. Please try again later.",
      fieldErrors: {},
      fieldValues: getContactFormData(formData),
    };
  }

  revalidatePath("/admin/messages");
  return {
    status: "success",
    message: "Thank you for contacting us. We'll be in touch soon.",
    fieldErrors: {},
    fieldValues: { name: "", email: "", phone: "", subject: "", message: "" },
  };
}

export async function getAdminContactMessages() {
  await requireAdmin();
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    select: contactMessageSelect,
  });
}

export async function updateContactMessageStatus(id: unknown, rawStatus: unknown) {
  await requireAdmin();
  const idResult = contactMessageIdSchema.safeParse(id);
  const statusResult = contactMessageStatusSchema.safeParse(rawStatus);
  if (!idResult.success || !statusResult.success) {
    return { success: false as const, error: "Invalid message or status." };
  }

  try {
    await prisma.contactMessage.update({
      where: { id: idResult.data },
      data: { status: statusResult.data },
      select: { id: true, status: true },
    });
    revalidatePath("/admin/messages");
    return { success: true as const, status: statusResult.data };
  } catch (error) {
    console.error("Contact message status update failed:", error);
    return { success: false as const, error: "Could not update this message." };
  }
}

export async function deleteContactMessage(id: unknown) {
  await requireAdmin();
  const idResult = contactMessageIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false as const, error: "Invalid message." };
  }

  try {
    await prisma.contactMessage.delete({ where: { id: idResult.data } });
    revalidatePath("/admin/messages");
    return { success: true as const };
  } catch (error) {
    console.error("Contact message deletion failed:", error);
    return { success: false as const, error: "Could not delete this message." };
  }
}
