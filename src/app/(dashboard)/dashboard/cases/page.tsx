import React from "react";
import { getCaseList, getCaseStats } from "./case-actions";
import { CaseTable } from "@/components/cases/CaseTable";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function CasesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedPage = Number(params.page);
  const page = Number.isFinite(requestedPage) && requestedPage > 0
    ? Math.max(Math.floor(requestedPage), 1)
    : 1;

  const [casesData, stats] = await Promise.all([
    getCaseList({
      search: params.search,
      status: params.status,
      priority: params.priority,
      category: params.category,
      page,
      limit: 12,
    }),
    getCaseStats(),
  ]);

  return (
    <CaseTable
      initialItems={casesData.items}
      totalItems={casesData.total}
      currentPage={casesData.page}
      totalPages={casesData.totalPages}
      stats={stats}
    />
  );
}
