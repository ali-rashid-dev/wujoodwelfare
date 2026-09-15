import React from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { BENEFICIARY_SEARCH_COOKIE } from "@/app/(dashboard)/dashboard/beneficiaries/constants";
import { getBeneficiaries, getBeneficiaryStats } from "@/app/(dashboard)/dashboard/beneficiaries/beneficiaries";
import { BeneficiaryTable } from "@/components/beneficiaries/BeneficiaryTable";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

import { Users, ShieldCheck, Clock, HeartHandshake, Plus } from "lucide-react";

export const metadata = {
  title: "Beneficiary Management - Wujood Welfare",
  description: "Central beneficiary database, assistance tracking, and verification",
};

interface PageProps {
  searchParams: Promise<{
    status?: string;
    gender?: string;
    page?: string;
  }>;
}

export default async function BeneficiariesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const search = (await cookies()).get(BENEFICIARY_SEARCH_COOKIE)?.value;
  const parsedPage = resolvedParams.page ? Number.parseInt(resolvedParams.page, 10) : 1;
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [data, stats] = await Promise.all([
    getBeneficiaries({
      search,
      status: resolvedParams.status,
      gender: resolvedParams.gender,
      page,
      limit: 10,
    }),
    getBeneficiaryStats(),
  ]);

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Beneficiary Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Centralized registry for managing beneficiary profiles, family vulnerabilities, document verifications, and aid distribution history.
          </p>
        </div>

        <Link
          href="/dashboard/beneficiaries/new"
          className={buttonVariants({ variant: "default", size: "default", className: "font-semibold text-xs gap-1.5 h-10 px-5" })}
        >
          <Plus className="w-4 h-4" /> Register New Beneficiary
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Total Beneficiaries</span>
              <span className="text-2xl font-extrabold text-foreground mt-0.5 block">{stats.total}</span>
              <span className="text-[11px] text-muted-foreground mt-1 block">Registered in database</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-emerald-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Verified Beneficiaries</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {stats.verified}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% verification rate
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-amber-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Pending Verification</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">
                {stats.pending}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">Requires background check</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-blue-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Total Aid Distributed</span>
              <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block">
                {formatPKR(stats.totalAssistanceAmount)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">Logged financial support</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Beneficiary Table */}
      <BeneficiaryTable initialData={data} initialSearch={search ?? ""} />
    </div>
  );
}
