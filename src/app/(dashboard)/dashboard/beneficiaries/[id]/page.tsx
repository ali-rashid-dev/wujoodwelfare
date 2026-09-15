import React from "react";
import { notFound } from "next/navigation";
import { getBeneficiary } from "@/app/(dashboard)/dashboard/beneficiaries/beneficiaries";
import { BeneficiaryProfile } from "@/components/beneficiaries/BeneficiaryProfile";

export const metadata = {
  title: "Beneficiary Profile - Wujood Welfare",
  description: "View detailed beneficiary record, assistance history, and documents",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BeneficiaryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const beneficiary = await getBeneficiary(id);

  if (!beneficiary) {
    notFound();
  }

  return (
    <div className="py-2">
      <BeneficiaryProfile beneficiary={beneficiary} />
    </div>
  );
}
