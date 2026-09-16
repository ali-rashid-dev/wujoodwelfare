import { z } from "zod";

export const caseStatusEnum = z.enum([
  "NEW",
  "ASSIGNED",
  "UNDER_ASSESSMENT",
  "VERIFICATION",
  "DECISION",
  "ASSISTANCE",
  "FOLLOW_UP",
  "CLOSED",
]);

export const casePriorityEnum = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const caseFormSchema = z.object({
  beneficiaryId: z.string().min(1, "Beneficiary selection is required"),
  title: z.string().min(3, "Case title must be at least 3 characters"),
  category: z.string().default("GENERAL"),
  priority: casePriorityEnum.default("MEDIUM"),
  description: z.string().optional().or(z.literal("")),
  assignedStaffId: z.string().optional().or(z.literal("")),
  documents: z.array(z.string()).default([]),
});

export const caseStatusUpdateSchema = z.object({
  targetStatus: caseStatusEnum,
  notes: z.string().optional().or(z.literal("")),
  closureReason: z.string().optional().or(z.literal("")),
});

export const caseAssessmentSchema = z.object({
  vulnerabilityScore: z.coerce.number().int().min(0).max(100).default(0),
  financialNeedScore: z.coerce.number().int().min(0).max(100).default(0),
  recommendation: z.string().min(5, "Recommendation text must be at least 5 characters"),
  findings: z.string().optional().or(z.literal("")),
});

export const caseVisitSchema = z.object({
  visitDate: z.string()
    .min(1, "Visit date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Visit date must be a valid date"),
  location: z.string().optional().or(z.literal("")),
  purpose: z.string().min(3, "Visit purpose is required"),
  findings: z.string().min(5, "Visit findings description is required"),
  outcome: z.string().optional().or(z.literal("")),
});

export const caseNoteSchema = z.object({
  content: z.string().min(3, "Case note content is required"),
  isInternal: z.boolean().default(true),
});

export const caseFollowUpSchema = z.object({
  nextFollowUpDate: z.string()
    .min(1, "Follow-up date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Follow-up date must be a valid date"),
  followUpPurpose: z.string().min(3, "Follow-up purpose is required"),
  notes: z.string().optional().or(z.literal("")),
});

export type CaseFormInput = z.infer<typeof caseFormSchema>;
export type CaseStatusUpdateInput = z.infer<typeof caseStatusUpdateSchema>;
export type CaseAssessmentInput = z.infer<typeof caseAssessmentSchema>;
export type CaseVisitInput = z.infer<typeof caseVisitSchema>;
export type CaseNoteInput = z.infer<typeof caseNoteSchema>;
export type CaseFollowUpInput = z.infer<typeof caseFollowUpSchema>;
