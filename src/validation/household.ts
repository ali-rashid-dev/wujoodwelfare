import { z } from "zod";
import { DocumentType, EmploymentStatus, Gender, HousingType } from "@prisma/client";

export const HousingTypeEnum = z.enum(HousingType);
export const EmploymentStatusEnum = z.enum(EmploymentStatus);
export const GenderEnum = z.enum(Gender);

export const householdMemberSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  cnic: z.string().optional().or(z.literal("")),
  relationToHead: z.enum([
    "HEAD",
    "SPOUSE",
    "SON",
    "DAUGHTER",
    "FATHER",
    "MOTHER",
    "BROTHER",
    "SISTER",
    "GRANDPARENT",
    "IN_LAW",
    "OTHER",
  ]),
  age: z.coerce.number().min(0).max(120).optional(),
  gender: GenderEnum.optional(),
  employmentStatus: EmploymentStatusEnum.optional(),
  monthlyIncome: z.coerce.number().min(0).default(0),
  isDisable: z.boolean().default(false),
  isElderly: z.boolean().default(false),
  isDependent: z.boolean().default(true),
  healthCondition: z.string().optional(),
  beneficiaryId: z.string().optional(),
});

export const householdDocumentSchema = z.object({
  title: z.string().min(2, "Document title is required"),
  type: z.enum(DocumentType).default("OTHER"),
  fileUrl: z.string().url("Must be a valid document URL"),
});

export const householdFormSchema = z.object({
  name: z.string().min(3, "Household name is required (e.g., Khan Family Household)"),
  headBeneficiaryId: z.string().optional().or(z.literal("")),
  monthlyIncome: z.coerce.number().min(0).default(0),
  housingType: HousingTypeEnum.default("RENTED"),
  housingCondition: z.string().optional(),
  notes: z.string().optional(),
  members: z.array(householdMemberSchema).min(1, "At least one household member is required"),
});

export type HouseholdMemberInput = z.infer<typeof householdMemberSchema>;
export type HouseholdDocumentInput = z.infer<typeof householdDocumentSchema>;
export type HouseholdFormInput = z.infer<typeof householdFormSchema>;
