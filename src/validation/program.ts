import { z } from "zod";

export const programStatusEnum = z.enum([
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
]);

export const assistanceTypeEnum = z.enum([
  "FOOD",
  "MEDICAL",
  "EDUCATION",
  "FINANCIAL",
  "HOUSING",
  "CLOTHING",
  "ORPHAN_SUPPORT",
  "DISABILITY_SUPPORT",
  "EMERGENCY_RELIEF",
  "MARRIAGE_ASSISTANCE",
  "EMPLOYMENT_SUPPORT",
  "MONTHLY_FINANCIAL_AID",
  "OTHER",
]);

export const documentTypeEnum = z.enum([
  "CNIC",
  "B_FORM",
  "PROOF_OF_INCOME",
  "PROOF_OF_RESIDENCE",
  "MEDICAL_REPORT",
  "ORPHAN_CERTIFICATE",
  "DISABILITY_CERTIFICATE",
  "MARRIAGE_CERTIFICATE",
  "JOB_APPLICATION",
  "ACADEMIC_RECORD",
  "OTHER",
]);

export const programFormSchema = z.object({
  name: z.string().min(2, "Program name must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
  eligibilityCriteria: z.string().optional().or(z.literal("")),
  budget: z.coerce.number().min(0, "Budget must be a non-negative number").default(0),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  status: programStatusEnum.default("ACTIVE"),
  assistanceType: assistanceTypeEnum.default("FINANCIAL"),
  requiredDocuments: z.array(documentTypeEnum).default([]),
  targetBeneficiaries: z.coerce.number().optional().or(z.literal("")),
  maxBeneficiaries: z.coerce.number().optional().or(z.literal("")),
});

export const programEnrollmentSchema = z.object({
  programId: z.string().min(1, "Program ID is required"),
  beneficiaryId: z.string().min(1, "Beneficiary selection is required"),
  notes: z.string().optional().or(z.literal("")),
});

export const programAidDisbursementSchema = z.object({
  programId: z.string().min(1, "Program ID is required"),
  beneficiaryId: z.string().min(1, "Beneficiary selection is required"),
  amount: z.coerce.number().min(0, "Amount must be a non-negative number"),
  quantity: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type ProgramFormInput = z.infer<typeof programFormSchema>;
export type ProgramEnrollmentInput = z.infer<typeof programEnrollmentSchema>;
export type ProgramAidDisbursementInput = z.infer<typeof programAidDisbursementSchema>;
