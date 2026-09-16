import React from "react";
import { notFound } from "next/navigation";
import { getApplicationById, getAvailableBeneficiariesAndPrograms } from "../../application-actions";
import { ApplicationForm } from "@/components/applications/ApplicationForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditApplicationPage({ params }: PageProps) {
  const { id } = await params;
  const [application, options] = await Promise.all([
    getApplicationById(id),
    getAvailableBeneficiariesAndPrograms(),
  ]);

  if (!application) {
    notFound();
  }

  return (
    <ApplicationForm
      beneficiaries={options.beneficiaries}
      programs={options.programs}
      initialData={application}
      isEditing
    />
  );
}
