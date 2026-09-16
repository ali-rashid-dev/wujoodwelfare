import React from "react";
import { notFound } from "next/navigation";
import { getApplicationById, getAvailableBeneficiariesAndPrograms } from "../application-actions";
import { ApplicationProfile } from "@/components/applications/ApplicationProfile";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [application, options] = await Promise.all([
    getApplicationById(id),
    getAvailableBeneficiariesAndPrograms(),
  ]);

  if (!application) {
    notFound();
  }

  return (
    <ApplicationProfile
      application={application}
      staffList={options.staff}
    />
  );
}
