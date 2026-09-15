import { z } from "zod";
import {
  AssistanceType,
  BeneficiaryStatus,
  DocumentType,
  EmploymentStatus,
} from "@prisma/client";

export const BeneficiaryStatusEnum = z.enum(BeneficiaryStatus);

export const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);

export const MaritalStatusEnum = z.enum([
  "SINGLE",
  "MARRIED",
  "WIDOWED",
  "DIVORCED",
]);

export const EmploymentStatusEnum = z.enum(EmploymentStatus);

export const HousingTypeEnum = z.enum([
  "OWNED",
  "RENTED",
  "SHARED",
  "HOMELESS",
]);

export const AssistanceTypeEnum = z.enum(AssistanceType);

export const DocumentTypeEnum = z.enum(DocumentType);

const optionalDate = z.string().refine(
  (value) => value === "" || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())),
  "Invalid date"
).optional();

// Personal Info schema
export const beneficiaryPersonalSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  cnic: z
    .string()
    .min(13, "CNIC must be at least 13 characters (e.g. 42101-1234567-1)")
    .max(15, "CNIC cannot exceed 15 characters"),
  fatherName: z.string().optional(),
  dateOfBirth: optionalDate,
  gender: GenderEnum.default("MALE"),
  status: BeneficiaryStatusEnum.default("PENDING"),
  isVerified: z.boolean().default(false),
  notes: z.string().optional(),
});

// Contact Info schema
export const beneficiaryContactSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  phone2: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

// Address Info schema
export const beneficiaryAddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().min(2, "City is required"),
  district: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
});

// Family Info schema
export const beneficiaryFamilySchema = z.object({
  maritalStatus: MaritalStatusEnum.default("SINGLE"),
  spouseName: z.string().optional(),
  dependents: z.coerce.number().min(0).default(0),
  disabledMembers: z.coerce.number().min(0).default(0),
});

// Economic Info schema
export const beneficiaryEconomicSchema = z.object({
  employmentStatus: EmploymentStatusEnum.default("UNEMPLOYED"),
  occupation: z.string().optional(),
  monthlyIncome: z.coerce.number().min(0).default(0),
  housingType: HousingTypeEnum.default("RENTED"),
});

// Document schema
export const beneficiaryDocumentSchema = z.object({
  label: z.string().min(2, "Document title/label is required"),
  type: DocumentTypeEnum.default("OTHER"),
  fileUrl: z.string().url("Must be a valid URL"),
});

// Case schema
export const beneficiaryCaseSchema = z.object({
  title: z.string().min(3, "Case title is required"),
  description: z.string().min(5, "Case description is required"),
  isOpen: z.boolean().default(true),
});

// Assistance Record schema
export const assistanceRecordSchema = z.object({
  type: AssistanceTypeEnum,
  amount: z.coerce.number().min(0).optional(),
  description: z.string().min(3, "Description is required"),
  givenAt: z.string().min(1, "Date is required").refine(
    (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
    "Invalid date"
  ),
  givenBy: z.string().optional(),
});

// Full Beneficiary Form Schema
export const beneficiaryFormSchema = beneficiaryPersonalSchema.extend({
  contact: beneficiaryContactSchema.optional(),
  address: beneficiaryAddressSchema.optional(),
  family: beneficiaryFamilySchema.optional(),
  economic: beneficiaryEconomicSchema.optional(),
});

export type BeneficiaryFormInput = z.infer<typeof beneficiaryFormSchema>;
export type BeneficiaryPersonalInput = z.infer<typeof beneficiaryPersonalSchema>;
export type BeneficiaryContactInput = z.infer<typeof beneficiaryContactSchema>;
export type BeneficiaryAddressInput = z.infer<typeof beneficiaryAddressSchema>;
export type BeneficiaryFamilyInput = z.infer<typeof beneficiaryFamilySchema>;
export type BeneficiaryEconomicInput = z.infer<typeof beneficiaryEconomicSchema>;
export type BeneficiaryDocumentInput = z.infer<typeof beneficiaryDocumentSchema>;
export type BeneficiaryCaseInput = z.infer<typeof beneficiaryCaseSchema>;
export type AssistanceRecordInput = z.infer<typeof assistanceRecordSchema>;
