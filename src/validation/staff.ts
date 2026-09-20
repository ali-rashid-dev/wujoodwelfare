import { z } from "zod";

export const staffFormSchema = z.object({
  name: z.string().min(2, "Staff member name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().optional().or(z.literal("")),
  designation: z.string().min(2, "Designation is required (e.g. Senior Field Inspector)"),
  role: z.enum([
    "ADMIN",
    "FIELD_OFFICER",
    "CASE_MANAGER",
    "VOLUNTEER_COORDINATOR",
    "FINANCE_OFFICER",
  ]).default("FIELD_OFFICER"),
  department: z.enum([
    "FIELD_OPERATIONS",
    "CASE_MANAGEMENT",
    "HEALTH_SERVICES",
    "EDUCATION",
    "LOGISTICS_RELIEF",
    "FINANCE_ADMIN",
  ]).default("FIELD_OPERATIONS"),
  status: z.enum(["ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED"]).default("ACTIVE"),
  permissions: z.array(z.string()).default([]),
  joinedAt: z.string().optional(),
  emergencyContact: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const caseAssignmentSchema = z.object({
  caseId: z.string().min(1, "Beneficiary case selection is required"),
  roleInCase: z.string().min(2, "Role in case is required (e.g., Primary Officer, Inspector)"),
  notes: z.string().optional().or(z.literal("")),
});

export const staffActivitySchema = z.object({
  action: z.string().min(2, "Activity action is required"),
  description: z.string().optional().or(z.literal("")),
  targetType: z.string().optional().or(z.literal("")),
  targetId: z.string().optional().or(z.literal("")),
});

export type StaffFormInput = z.infer<typeof staffFormSchema>;
export type CaseAssignmentInput = z.infer<typeof caseAssignmentSchema>;
export type StaffActivityInput = z.infer<typeof staffActivitySchema>;
