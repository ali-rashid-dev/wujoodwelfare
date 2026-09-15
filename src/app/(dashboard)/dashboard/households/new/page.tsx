import React from "react";
import { requireServerSession } from "@/lib/auth-server";
import { getBeneficiaryOptions } from "@/app/(dashboard)/dashboard/households/households";
import { HouseholdForm } from "@/components/households/HouseholdForm";

export const metadata = {
  title: "Register New Household - Wujood Welfare",
  description: "Create household, assign head of family, add dependents and calculate welfare assessment",
};

export default async function NewHouseholdPage() {
  await requireServerSession();

  const beneficiaries = await getBeneficiaryOptions({ page: 1, limit: 25 });

  return <HouseholdForm initialBeneficiaries={beneficiaries.items} initialTotalPages={beneficiaries.totalPages} />;
}
