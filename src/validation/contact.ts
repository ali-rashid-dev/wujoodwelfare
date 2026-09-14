import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Your name is required (min 2 characters)"),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || (val.length >= 7 && /^[0-9+\-\s()]+$/.test(val)),
      "Please enter a valid phone number"
    ),
  subject: z.string().trim().min(3, "Subject is required (min 3 characters)"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters long"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
