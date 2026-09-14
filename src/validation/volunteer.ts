import { z } from "zod";

export const volunteerApplicationSchema = z.object({
  name: z.string().trim().min(2, "Full name is required (min 2 characters)"),
  father_name: z.string().trim().min(2, "Father name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => val.replace(/[^0-9]/g, "").length >= 7,
      "Phone number must be at least 7 digits"
    )
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  city: z.string().trim().min(2, "City is required"),
  qualification: z.string().trim().min(2, "Qualification is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a gender",
  }),
  skills: z.string().optional(),
  availability: z.enum(
    ["Weekends only", "Weekdays evenings", "Full week", "One-off events"],
    {
      message: "Please select your availability",
    }
  ),
  statement_of_purpose: z
    .string()
    .trim()
    .min(10, "Statement of purpose must be at least 10 characters long")
    .refine(
      (val) => val.trim().split(/\s+/).filter(Boolean).length <= 200,
      "Statement of Purpose must be 200 words or less"
    ),
});

export type VolunteerApplicationInput = z.infer<typeof volunteerApplicationSchema>;
