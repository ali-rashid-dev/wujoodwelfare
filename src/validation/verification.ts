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
}).refine(
  (data) => Boolean(data.beneficiaryId || data.applicationId || data.caseId),
  { message: "A beneficiary, application, or case must be selected.", path: ["beneficiaryId"] },
);

export const identityVerificationSchema = z.object({
  identityStatus: verificationCheckStatusEnum.default("PENDING"),
  cnicVerified: z.boolean().default(false),
  bformVerified: z.boolean().default(false),
  biometricStatus: z.string().default("UNVERIFIED"),
  nadraRefNo: z.string().optional().or(z.literal("")),
  identityNotes: z.string().optional().or(z.literal("")),
});

export const documentVerificationSchema = z.object({
  documentStatus: verificationCheckStatusEnum.default("PENDING"),
  docAuthenticityChecked: z.boolean().default(false),
  missingDocuments: z.array(z.string()).default([]),
  documentNotes: z.string().optional().or(z.literal("")),
});

export const householdVerificationSchema = z.object({
  householdStatus: verificationCheckStatusEnum.default("PENDING"),
  verifiedFamilySize: z.coerce.number().int().min(1).optional(),
  verifiedDependents: z.coerce.number().int().min(0).optional(),
  verifiedHousingCondition: z.string().optional().or(z.literal("")),
  assetAuditSummary: z.string().optional().or(z.literal("")),
  householdNotes: z.string().optional().or(z.literal("")),
});

export const incomeAssessmentSchema = z.object({
  incomeStatus: verificationCheckStatusEnum.default("PENDING"),
  declaredIncome: z.coerce.number().min(0),
  verifiedIncome: z.coerce.number().min(0),
  incomeThreshold: z.coerce.number().min(0).default(45000),
  povertyScoreIndex: z.coerce.number().int().min(0).max(100),
  incomeNotes: z.string().optional().or(z.literal("")),
});

export const fieldVerificationSchema = z.object({
  fieldStatus: verificationCheckStatusEnum.default("PENDING"),
  fieldOfficerId: z.string().optional().or(z.literal("")),
  fieldOfficerName: z.string().optional().or(z.literal("")),
  fieldVisitDate: z.string().optional().or(z.literal("")),
  neighborCheckPassed: z.boolean().default(false),
  physicalAddressVerified: z.boolean().default(false),
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
