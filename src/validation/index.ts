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
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(7, "Phone number is required."),
  subject: z.string().min(3, "Subject is required."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

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
