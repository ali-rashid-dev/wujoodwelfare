import { z } from "zod";

export const PROGRAM_STATUSES = ["draft", "published", "archived"] as const;
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

export const PROGRAM_CATEGORIES = [
  "Food",
  "Medical",
  "Education",
  "Clothes",
  "Awareness",
  "Emergency",
  "Community",
  "Other",
] as const;

export const programStatusSchema = z.enum(PROGRAM_STATUSES);

export const programSchema = z.object({
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
  category: z.string().min(2, "Category is required."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(3000, "Description cannot exceed 3000 characters."),
  status: programStatusSchema.default("draft"),
  imageUrl: z.string().optional().nullable().or(z.literal("")),
});

export type ProgramInput = z.infer<typeof programSchema>;
