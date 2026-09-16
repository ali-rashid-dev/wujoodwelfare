import React from "react";
import { getAvailableBeneficiariesAndPrograms } from "../application-actions";
import { ApplicationForm } from "@/components/applications/ApplicationForm";

export default async function NewApplicationPage() {
  const options = await getAvailableBeneficiariesAndPrograms();

  return (
    <ApplicationForm
      beneficiaries={options.beneficiaries}
      programs={options.programs}
    />
  );
}
