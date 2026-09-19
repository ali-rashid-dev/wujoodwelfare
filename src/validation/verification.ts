import { z } from "zod";

export const verificationStatusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "VERIFIED",
  "REJECTED",
  "FLAGGED_FRAUD",
  "NEEDS_MORE_INFO",
]);

export const verificationCheckStatusEnum = z.enum([
  "PASSED",
  "FAILED",
  "WARNING",
  "PENDING",
]);

export const verificationFormSchema = z.object({
  beneficiaryId: z.string().optional().or(z.literal("")),
  applicationId: z.string().optional().or(z.literal("")),
  caseId: z.string().optional().or(z.literal("")),
  verifierName: z.string().default("Verification Officer"),
  notes: z.string().optional().or(z.literal("")),
});

export const identityVerificationSchema = z.object({
  identityStatus: verificationCheckStatusEnum.default("PASSED"),
  cnicVerified: z.boolean().default(true),
  bformVerified: z.boolean().default(true),
  biometricStatus: z.string().default("VERIFIED"),
  nadraRefNo: z.string().optional().or(z.literal("")),
  identityNotes: z.string().optional().or(z.literal("")),
});

export const documentVerificationSchema = z.object({
  documentStatus: verificationCheckStatusEnum.default("PASSED"),
  docAuthenticityChecked: z.boolean().default(true),
  missingDocuments: z.array(z.string()).default([]),
  documentNotes: z.string().optional().or(z.literal("")),
});

export const householdVerificationSchema = z.object({
  householdStatus: verificationCheckStatusEnum.default("PASSED"),
  verifiedFamilySize: z.coerce.number().int().min(1).default(1),
  verifiedDependents: z.coerce.number().int().min(0).default(0),
  verifiedHousingCondition: z.string().optional().or(z.literal("")),
  assetAuditSummary: z.string().optional().or(z.literal("")),
  householdNotes: z.string().optional().or(z.literal("")),
});

export const incomeAssessmentSchema = z.object({
  incomeStatus: verificationCheckStatusEnum.default("PASSED"),
  declaredIncome: z.coerce.number().min(0).default(0),
  verifiedIncome: z.coerce.number().min(0).default(0),
  incomeThreshold: z.coerce.number().min(0).default(45000),
  povertyScoreIndex: z.coerce.number().int().min(0).max(100).default(35),
  incomeNotes: z.string().optional().or(z.literal("")),
});

export const fieldVerificationSchema = z.object({
  fieldStatus: verificationCheckStatusEnum.default("PASSED"),
  fieldOfficerId: z.string().optional().or(z.literal("")),
  fieldOfficerName: z.string().optional().or(z.literal("")),
  fieldVisitDate: z.string().optional().or(z.literal("")),
  neighborCheckPassed: z.boolean().default(true),
  physicalAddressVerified: z.boolean().default(true),
  fieldNotes: z.string().optional().or(z.literal("")),
});

export const eligibilityCheckitemSchema = z.object({
  id: z.string(),
  label: z.string(),
  passed: z.boolean(),
  weight: z.number().default(10),
  notes: z.string().optional(),
});

export const eligibilityChecklistSchema = z.object({
  checklistData: z.array(eligibilityCheckitemSchema),
  overallScore: z.coerce.number().int().min(0).max(100).default(75),
});

export const verificationDecisionSchema = z.object({
  targetStatus: verificationStatusEnum,
  overallScore: z.coerce.number().int().min(0).max(100).default(75),
  decisionReason: z.string().min(5, "Decision reason must be at least 5 characters"),
});

export type VerificationFormInput = z.infer<typeof verificationFormSchema>;
export type IdentityVerificationInput = z.infer<typeof identityVerificationSchema>;
export type DocumentVerificationInput = z.infer<typeof documentVerificationSchema>;
export type HouseholdVerificationInput = z.infer<typeof householdVerificationSchema>;
export type IncomeAssessmentInput = z.infer<typeof incomeAssessmentSchema>;
export type FieldVerificationInput = z.infer<typeof fieldVerificationSchema>;
export type EligibilityChecklistInput = z.infer<typeof eligibilityChecklistSchema>;
export type VerificationDecisionInput = z.infer<typeof verificationDecisionSchema>;
