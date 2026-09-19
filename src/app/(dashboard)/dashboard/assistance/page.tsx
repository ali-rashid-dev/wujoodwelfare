import React from "react";
import { getAssistanceList, getAssistanceStats, getAssistanceOptions } from "./assistance-actions";
import { AssistanceStatsCards } from "@/components/assistance/AssistanceStatsCards";
import { AssistanceTable } from "@/components/assistance/AssistanceTable";

interface AssistancePageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AssistanceDashboardPage({ searchParams }: AssistancePageProps) {
  const params = await searchParams;
  const requestedPage = Number(params.page);
  const page = Number.isFinite(requestedPage) && requestedPage > 0
    ? Math.max(Math.floor(requestedPage), 1)
    : 1;

  const [assistanceData, stats, options] = await Promise.all([
    getAssistanceList({
      search: params.search,
      type: params.type,
      status: params.status,
      page,
      limit: 12,
    }),
    getAssistanceStats(),
    getAssistanceOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Assistance Management</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Module 10 — Full assistance disbursement log for Cash, Food, Medicine, Education, Clothing, Equipment, Housing, and Emergency Relief.
        </p>
      </div>

      <AssistanceStatsCards stats={stats} />

      <AssistanceTable
        initialItems={assistanceData.items}
        total={assistanceData.total}
        currentPage={assistanceData.page}
        totalPages={assistanceData.totalPages}
        options={options}
      />
    </div>
  );
}
