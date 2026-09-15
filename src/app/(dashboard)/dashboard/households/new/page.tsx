import React from "react";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/auth-server";
import { HouseholdForm } from "@/components/households/HouseholdForm";

export const metadata = {
  title: "Register New Household - Wujood Welfare",
  description: "Create household, assign head of family, add dependents and calculate welfare assessment",
};

export default async function NewHouseholdPage() {
  await requireServerSession();

  // Fetch list of beneficiaries for head selection dropdown
  const beneficiaries = await prisma.beneficiary.findMany({
    select: {
      id: true,
      name: true,
      cnic: true,
    },
    orderBy: { name: "asc" },
    take: 200,
  });

  return <HouseholdForm beneficiaries={beneficiaries} />;
}
