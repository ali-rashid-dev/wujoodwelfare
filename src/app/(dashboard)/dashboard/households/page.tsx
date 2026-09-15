import React from "react";
import Link from "next/link";
import { getHouseholds, getHouseholdStats } from "@/app/(dashboard)/dashboard/households/households";
import { HouseholdTable } from "@/components/households/HouseholdTable";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Home, ShieldAlert, Users, Plus, HeartHandshake, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Household & Family Management - Wujood Welfare",
  description: "Family-level welfare assessment, household head management, and dependents tracking",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function HouseholdsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const parsedPage = resolvedParams.page ? Number.parseInt(resolvedParams.page, 10) : 1;
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [data, stats] = await Promise.all([
    getHouseholds({
      category: resolvedParams.category,
      search: resolvedParams.search,
      page,
      limit: 10,
    }),
    getHouseholdStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Home className="w-6 h-6 text-primary" /> Household & Family Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Family-level welfare assessment, household head registration, dependents tracking, and shelter vulnerability evaluation.
          </p>
        </div>

        <Link
          href="/dashboard/households/new"
          className={buttonVariants({ variant: "default", size: "default", className: "font-semibold text-xs gap-1.5 h-10 px-5" })}
        >
          <Plus className="w-4 h-4" /> Register New Household
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Total Households</span>
              <span className="text-2xl font-extrabold text-foreground mt-0.5 block">{stats.total}</span>
              <span className="text-[11px] text-muted-foreground mt-1 block">Registered family units</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-rose-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Critical Vulnerability</span>
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5 block">
                {stats.critical}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">Extreme welfare priority</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-amber-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">High Need Families</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">
                {stats.high}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">Priority ration & aid candidates</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-blue-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Total Dependents Supported</span>
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block">
                {stats.totalDependents}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">Across {stats.totalMembers} total family members</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Household Table */}
      <HouseholdTable initialData={data} />
    </div>
  );
}
