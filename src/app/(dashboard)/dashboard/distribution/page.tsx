import React from "react";
import { getDistributionList, getDistributionStats, getDistributionOptions } from "./distribution-actions";
import { DistributionStatsCards } from "@/components/distribution/DistributionStatsCards";
import { DistributionTable } from "@/components/distribution/DistributionTable";

interface DistributionPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    centerId?: string;
    page?: string;
  }>;
}

export default async function DistributionDashboardPage({ searchParams }: DistributionPageProps) {
  const params = await searchParams;
  const requestedPage = Number(params.page);
  const page = Number.isFinite(requestedPage) && requestedPage > 0
    ? Math.max(Math.floor(requestedPage), 1)
    : 1;

  const [distributionData, stats, options] = await Promise.all([
    getDistributionList({
      search: params.search,
      status: params.status,
      centerId: params.centerId,
      page,
      limit: 12,
    }),
    getDistributionStats(),
    getDistributionOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Physical Distribution Tracking</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Module 11 — Physical delivery tracking: Approved &rarr; Scheduled &rarr; Distributed &rarr; Beneficiary Confirmation.
        </p>
      </div>

      <DistributionStatsCards stats={stats} />

      <DistributionTable
        initialItems={distributionData.items}
        total={distributionData.total}
        currentPage={distributionData.page}
        totalPages={distributionData.totalPages}
        options={options}
      />
    </div>
  );
}
