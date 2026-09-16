import React from "react";
import { getCaseOptions } from "../case-actions";
import { CaseForm } from "@/components/cases/CaseForm";

export default async function NewCasePage() {
  const { beneficiaries, staff } = await getCaseOptions();

  return (
    <CaseForm
      beneficiaries={beneficiaries}
      staffList={staff}
    />
  );
}
