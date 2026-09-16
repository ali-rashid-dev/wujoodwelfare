import React from "react";
import { notFound } from "next/navigation";
import { getCaseById, getCaseOptions } from "../case-actions";
import { CaseProfile } from "@/components/cases/CaseProfile";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [caseItem, options] = await Promise.all([
    getCaseById(id),
    getCaseOptions(),
  ]);

  if (!caseItem) {
    notFound();
  }

  return (
    <CaseProfile
      caseItem={caseItem}
      staffList={options.staff}
    />
  );
}
