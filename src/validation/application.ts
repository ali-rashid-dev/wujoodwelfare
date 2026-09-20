import { z } from "zod";
import { AssistanceType } from "@prisma/client";

export const applicationStatusEnum = z.enum([
  "SUBMITTED",
  "INITIAL_REVIEW",
  "VERIFICATION",
  "ELIGIBILITY_ASSESSMENT",
  "APPROVED",
  "REJECTED",
]);

export const applicationPriorityEnum = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const applicationFormSchema = z.object({
  beneficiaryId: z.string().min(1, "Beneficiary selection is required"),
  programId: z.string().optional().or(z.literal("")),
  assistanceType: z.enum(AssistanceType).default("FINANCIAL"),
  requestedAmount: z.coerce.number().min(0, "Requested amount must be non-negative").optional().or(z.literal("")),
  requestedItems: z.string().optional().or(z.literal("")),
  reason: z.string().min(10, "Please provide a detailed hardship narrative (at least 10 characters)"),
  priority: applicationPriorityEnum.default("MEDIUM"),
  documents: z.array(z.string()).default([]),
});

export const applicationStatusUpdateSchema = z.object({
  targetStatus: applicationStatusEnum,
  notes: z.string().optional().or(z.literal("")),
  rejectionReason: z.string().optional().or(z.literal("")),
});

export const assignReviewerSchema = z.object({
  reviewerId: z.string().min(1, "Reviewer selection is required"),
});

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;
export type ApplicationStatusUpdateInput = z.infer<typeof applicationStatusUpdateSchema>;
export type AssignReviewerInput = z.infer<typeof assignReviewerSchema>;
