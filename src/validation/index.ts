import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long."),
  confirmPassword: z.string().min(8, "Please confirm your new password."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const verifyEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100, "Name cannot exceed 100 characters."),
  email: z.string().trim().email("Please enter a valid email address.").max(254, "Email cannot exceed 254 characters."),
  phone: z.string().trim().max(40, "Phone number cannot exceed 40 characters.").optional().or(z.literal("")),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters.").max(160, "Subject cannot exceed 160 characters."),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(5000, "Message cannot exceed 5000 characters."),
});

export const CONTACT_MESSAGE_STATUSES = ["new", "in_progress", "resolved"] as const;
export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];
export const contactMessageStatusSchema = z.enum(CONTACT_MESSAGE_STATUSES);

export type ContactFormField = "name" | "email" | "phone" | "subject" | "message";
export type ContactSubmissionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<ContactFormField, string>>;
};

export const initialContactSubmissionState: ContactSubmissionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export const volunteerApplicationSchema = z.object({
  name: z.string().min(2, "Full name is required."),
  father_name: z.string().min(2, "Father name is required."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(7, "Phone number is required."),
  city: z.string().min(2, "City is required."),
  qualification: z.string().min(2, "Qualification is required."),
  gender: z.enum(["Male", "Female", "Other"]),
  skills: z.string().optional().or(z.literal("")),
  availability: z.enum(["Weekends only", "Weekdays evenings", "Full week", "One-off events"]),
  statement_of_purpose: z.string().min(20, "Statement of purpose must be at least 20 characters."),
});
