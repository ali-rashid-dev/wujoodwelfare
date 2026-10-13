import { z } from "zod";
import { isValid, parseISO } from "date-fns";

export const PROJECT_STATUSES = ["planned", "active", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const projectStatusSchema = z.enum(PROJECT_STATUSES);

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value));
}

const optionalDateSchema = z
  .string()
  .refine((value) => value === "" || isValidDateString(value), "Enter a valid date.")
  .optional()
  .nullable();

export const projectSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters.")
    .max(120, "Title cannot exceed 120 characters."),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .max(120, "Slug cannot exceed 120 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must only contain lowercase letters, numbers, and hyphens."
    )
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(5000, "Description cannot exceed 5000 characters."),
  images: z.array(z.string().url("Each image must be a valid URL.")).optional().default([]),
  status: projectStatusSchema.default("planned"),
  published: z.boolean().default(false),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  location: z.string().max(200).optional().nullable().or(z.literal("")),
  programId: z.string().optional().nullable().or(z.literal("")),
}).refine(
  ({ startDate, endDate }) =>
    !startDate ||
    !endDate ||
    !isValidDateString(startDate) ||
    !isValidDateString(endDate) ||
    Date.parse(endDate) >= Date.parse(startDate),
  {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
  }
);

export type ProjectInput = z.infer<typeof projectSchema>;
