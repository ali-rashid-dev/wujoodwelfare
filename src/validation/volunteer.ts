import { z } from "zod";

export const volunteerFormSchema = z.object({
  name: z.string().min(2, "Volunteer full name is required"),
  cnic: z.string().optional().or(z.literal("")),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(8, "Phone number is required"),
  status: z.enum([
    "APPLIED",
    "INTERVIEWED",
    "ACTIVE",
    "INACTIVE",
    "REJECTED",
  ]).default("APPLIED"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  availability: z.enum([
    "WEEKDAYS",
    "WEEKENDS",
    "EVENINGS",
    "FULL_TIME",
    "ON_CALL",
  ]).default("WEEKENDS"),
  city: z.string().optional().or(z.literal("")),
  district: z.string().optional().or(z.literal("")),
  area: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const campaignFormSchema = z.object({
  title: z.string().min(3, "Campaign title is required (e.g., Ramadan Ration Drive 2026)"),
  description: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  targetBeneficiaries: z.coerce.number().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "ON_HOLD"]).default("PLANNING"),
});

export const campaignAssignmentSchema = z.object({
  campaignId: z.string().min(1, "Welfare campaign selection is required"),
  role: z.string().optional().or(z.literal("")),
  hoursLogged: z.coerce.number().min(0).default(0),
  status: z.string().default("ASSIGNED"),
});

export const volunteerActivitySchema = z.object({
  title: z.string().min(2, "Activity title is required"),
  description: z.string().optional().or(z.literal("")),
  hours: z.coerce.number().min(1, "Hours logged must be at least 1"),
  activityDate: z.string().optional(),
  location: z.string().optional().or(z.literal("")),
  feedback: z.string().optional().or(z.literal("")),
});

export const volunteerApplicationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  father_name: z.string().min(2, "Father name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is required"),
  city: z.string().min(2, "City is required"),
  qualification: z.string().min(2, "Qualification is required"),
  gender: z.string().min(1, "Select gender"),
  skills: z.string().optional().or(z.literal("")),
  availability: z.string().min(1, "Select availability"),
  statement_of_purpose: z
    .string()
    .min(10, "Statement of purpose required")
    .refine((val) => val.trim().split(/\s+/).filter(Boolean).length <= 200, {
      message: "Maximum 200 words allowed",
    }),
});

export type VolunteerFormInput = z.infer<typeof volunteerFormSchema>;
export type CampaignFormInput = z.infer<typeof campaignFormSchema>;
export type CampaignAssignmentInput = z.infer<typeof campaignAssignmentSchema>;
export type VolunteerActivityInput = z.infer<typeof volunteerActivitySchema>;
export type VolunteerApplicationInput = z.infer<typeof volunteerApplicationSchema>;
