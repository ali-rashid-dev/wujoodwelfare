import React from "react";
import { getApplicationList, getApplicationStats, getAvailableBeneficiariesAndPrograms } from "./application-actions";
import { ApplicationTable } from "@/components/applications/ApplicationTable";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    programId?: string;
    page?: string;
  }>;
}

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [applicationsData, stats, options] = await Promise.all([
    getApplicationList({
      search: params.search,
      status: params.status,
      priority: params.priority,
      programId: params.programId,
      page,
      limit: 12,
    }),
    getApplicationStats(),
    getAvailableBeneficiariesAndPrograms(),
  ]);

  return (
    <ApplicationTable
      initialItems={applicationsData.items}
      totalItems={applicationsData.total}
      currentPage={applicationsData.page}
      totalPages={applicationsData.totalPages}
      stats={stats}
      programsList={options.programs}
    />
  );
}
