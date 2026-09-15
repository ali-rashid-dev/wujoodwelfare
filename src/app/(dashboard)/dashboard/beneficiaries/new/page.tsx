import React from "react";
import { BeneficiaryForm } from "@/components/beneficiaries/BeneficiaryForm";

export const metadata = {
  title: "New Beneficiary - Wujood Welfare",
  description: "Register a new beneficiary in the central database",
};

export default function NewBeneficiaryPage() {
  return (
    <div className="py-2">
      <BeneficiaryForm isEdit={false} />
    </div>
  );
}
