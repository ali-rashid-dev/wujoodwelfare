import React from "react";
import { notFound } from "next/navigation";
import { getCaseById, getCaseOptions } from "../../case-actions";
import { CaseForm } from "@/components/cases/CaseForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCasePage({ params }: PageProps) {
  const { id } = await params;
  const caseItem = await getCaseById(id);

  if (!caseItem) {
    notFound();
  }

  const options = await getCaseOptions(caseItem.beneficiaryId);

  return (
    <CaseForm
      beneficiaries={options.beneficiaries}
      staffList={options.staff}
      initialData={{
        id: caseItem.id,
        caseNumber: caseItem.caseNumber,
        beneficiaryId: caseItem.beneficiaryId,
        title: caseItem.title,
        category: caseItem.category,
        priority: caseItem.priority,
        description: caseItem.description,
        documents: caseItem.documents,
        assignments: caseItem.assignments,
      }}
      isEditing
    />
  );
}
