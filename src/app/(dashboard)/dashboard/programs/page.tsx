import React from "react";
import { getProgramList, getProgramStats } from "./program-actions";
import { ProgramTable } from "@/components/programs/ProgramTable";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    assistanceType?: string;
    page?: string;
  }>;
}

export default async function ProgramsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [programsData, stats] = await Promise.all([
    getProgramList({
      search: params.search,
      status: params.status,
      assistanceType: params.assistanceType,
      page,
      limit: 12,
    }),
    getProgramStats(),
  ]);

  return (
    <ProgramTable
      initialItems={programsData.items}
      totalItems={programsData.total}
      currentPage={programsData.page}
      totalPages={programsData.totalPages}
      stats={stats}
    />
  );
}
