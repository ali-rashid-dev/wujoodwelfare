import React from "react";
import { notFound } from "next/navigation";
import { getBeneficiary } from "@/app/(dashboard)/dashboard/beneficiaries/beneficiaries";
import { BeneficiaryForm } from "@/components/beneficiaries/BeneficiaryForm";

export const metadata = {
  title: "Edit Beneficiary - Wujood Welfare",
  description: "Edit beneficiary record and family details",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBeneficiaryPage({ params }: PageProps) {
  const { id } = await params;
  const beneficiary = await getBeneficiary(id);

  if (!beneficiary) {
    notFound();
  }

  return (
    <div className="py-2">
      <BeneficiaryForm initialData={beneficiary} isEdit={true} />
    </div>
  );
}
