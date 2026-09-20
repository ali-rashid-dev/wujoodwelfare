import { z } from "zod";

export const distributionStatusEnum = z.enum([
  "APPROVED",
  "SCHEDULED",
  "DISTRIBUTED",
  "BENEFICIARY_CONFIRMED",
  "FAILED_DELIVERY",
]);

export const distributionFormSchema = z.object({
  assistanceRecordId: z.string().optional().or(z.literal("")),
  beneficiaryId: z.string().min(1, "Beneficiary selection is required"),
  caseId: z.string().optional().or(z.literal("")),
  programId: z.string().optional().or(z.literal("")),
  centerId: z.string().optional().or(z.literal("")),
  centerName: z.string().optional().or(z.literal("")),
  itemsSummary: z.string().min(3, "Items summary description is required"),
  quantity: z.coerce.number().int().min(1).default(1),
  scheduledDate: z.string().optional().or(z.literal("")),
  staffName: z.string().optional().or(z.literal("")),
  recipientName: z.string().optional().or(z.literal("")),
  recipientCnic: z.string().optional().or(z.literal("")),
});

export const distributionCenterSchema = z.object({
  name: z.string().min(3, "Center name must be at least 3 characters"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  inChargeName: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const distributionStatusUpdateSchema = z.object({
  targetStatus: distributionStatusEnum,
  recipientName: z.string().optional().or(z.literal("")),
  recipientCnic: z.string().optional().or(z.literal("")),
  receiptNumber: z.string().optional().or(z.literal("")),
  proofPhotoUrl: z.string().optional().or(z.literal("")),
  confirmationNotes: z.string().optional().or(z.literal("")),
});

export type DistributionFormInput = z.infer<typeof distributionFormSchema>;
export type DistributionCenterInput = z.infer<typeof distributionCenterSchema>;
export type DistributionStatusUpdateInput = z.infer<typeof distributionStatusUpdateSchema>;
