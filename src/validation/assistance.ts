import { z } from "zod";
import { assistanceTypeEnum } from "./program";

export { assistanceTypeEnum };


export const assistanceStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "DISBURSED",
  "CANCELLED",
]);

export const distributionMethodEnum = z.enum([
  "BANK_TRANSFER",
  "CASH_HANDOVER",
  "DISTRIBUTION_CENTER",
  "HOME_DELIVERY",
  "PARTNER_VOUCHER",
  "CHEQUE",
]);

export const assistanceFormSchema = z.object({
  beneficiaryId: z.string().min(1, "Beneficiary is required"),
  caseId: z.string().optional().or(z.literal("")),
  programId: z.string().optional().or(z.literal("")),
  type: assistanceTypeEnum.default("FOOD"),
  description: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().min(0).optional().default(0),
  quantity: z.string().optional().or(z.literal("")),
  status: assistanceStatusEnum.default("DISBURSED"),
  distributionMethod: distributionMethodEnum.default("DISTRIBUTION_CENTER"),
  givenAt: z.string().optional().or(z.literal("")),
  givenBy: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type AssistanceFormInput = z.infer<typeof assistanceFormSchema>;
