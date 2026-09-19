import React from "react";
import { getVerificationList, getVerificationStats, getVerificationOptions } from "./verification-actions";
import { VerificationStatsCards } from "@/components/verification/VerificationStatsCards";
import { VerificationTable } from "@/components/verification/VerificationTable";

interface VerificationPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function VerificationDashboardPage({ searchParams }: VerificationPageProps) {
  const params = await searchParams;
  const requestedPage = Number(params.page);
  const page = Number.isFinite(requestedPage) && requestedPage > 0
    ? Math.max(Math.floor(requestedPage), 1)
    : 1;

  const [verificationsData, stats, options] = await Promise.all([
    getVerificationList({
      search: params.search,
      status: params.status,
      page,
      limit: 12,
    }),
    getVerificationStats(),
    getVerificationOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Verification & Eligibility Center</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Identity verification, document check, household audit, and income threshold assessment to reduce fraud.
        </p>
      </div>

      <VerificationStatsCards stats={stats} />

      <VerificationTable
        initialItems={verificationsData.items}
        total={verificationsData.total}
        currentPage={verificationsData.page}
        totalPages={verificationsData.totalPages}
        options={options}
      />
    </div>
  );
}
