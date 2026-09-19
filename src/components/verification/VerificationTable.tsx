"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShieldCheck,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  User,
  Briefcase,
  FileText,
  Filter,
} from "lucide-react";
import { NewVerificationModal } from "@/components/verification/NewVerificationModal";

interface VerificationItem {
  id: string;
  verificationCode: string;
  verifierName: string;
  status: string;
  overallScore: number;
  identityStatus: string;
  cnicVerified: boolean;
  documentStatus: string;
  householdStatus: string;
  incomeStatus: string;
  fieldStatus: string;
  createdAt: string;
  beneficiary: { id: string; name: string; cnic: string | null; phone: string | null; status: string } | null;
  caseItem: { id: string; caseNumber: string | null; title: string; status: string } | null;
  application: { id: string; applicationCode: string; assistanceType: string; status: string } | null;
  _count: { logs: number };
}

interface VerificationTableProps {
  initialItems: VerificationItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  options: {
    beneficiaries: Array<{ id: string; name: string; cnic: string | null; phone: string | null; status: string }>;
    cases: Array<{ id: string; caseNumber: string | null; title: string; beneficiary: { name: string; cnic: string | null } }>;
    applications: Array<{ id: string; applicationCode: string; assistanceType: string; beneficiary: { name: string; cnic: string | null } }>;
    staff: Array<{ id: string; name: string; designation: string; department: string }>;
  };
}

const STATUS_BADGES: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "Pending", color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  VERIFIED: { label: "Verified & Qualified", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  REJECTED: { label: "Rejected / Unqualified", color: "bg-slate-100 text-slate-700 border-slate-200", icon: XCircle },
  FLAGGED_FRAUD: { label: "Flagged Fraud", color: "bg-red-100 text-red-700 border-red-200 font-bold animate-pulse", icon: AlertTriangle },
  NEEDS_MORE_INFO: { label: "Needs Info", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
};

const CHECK_BADGES: Record<string, { label: string; color: string }> = {
  PASSED: { label: "Passed", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  FAILED: { label: "Failed", color: "bg-red-50 text-red-700 border-red-200" },
  WARNING: { label: "Warning", color: "bg-amber-50 text-amber-700 border-amber-200" },
  PENDING: { label: "Pending", color: "bg-slate-50 text-slate-600 border-slate-200" },
};

export function VerificationTable({
  initialItems,
  total,
  currentPage,
  totalPages,
  options,
}: VerificationTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const items = initialItems;
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const statusFilter = searchParams.get("status") || "ALL";
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFilter = (key: string, val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val && val !== "ALL") {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    if (key === "page") params.set("page", val);
    else params.set("page", "1");
    router.push(`/dashboard/verification?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilter("search", search);
  };

  return (
    <Card className="shadow-xs border-border/60">
      <CardHeader className="p-4 sm:p-6 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Verification Records & Eligibility Workbench</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {items.length} of {total} verification checks across cases, applications, and beneficiaries
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="font-semibold text-xs gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Verification Audit
          </Button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 pt-4 border-t border-border/40">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, beneficiary name, CNIC, case #..."
              className="pl-9 text-xs h-9"
            />
          </form>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <Select value={statusFilter} onValueChange={(val) => { if (val) handleFilter("status", val); }}>

              <SelectTrigger className="text-xs h-9 w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Verification Statuses</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="VERIFIED">Verified & Qualified</SelectItem>
                <SelectItem value="FLAGGED_FRAUD">Flagged Fraud</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="NEEDS_MORE_INFO">Needs Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="p-4 rounded-full bg-slate-100 text-slate-400 mb-3">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h4 className="font-semibold text-sm text-foreground">No verification records found</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              No verification checks match your criteria. Click &quot;New Verification Audit&quot; to initiate identity & eligibility checks.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              size="sm"
              className="mt-4 text-xs font-semibold"
            >
              Start First Verification
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Verification Code</th>
                  <th className="py-3 px-4">Beneficiary / CNIC</th>
                  <th className="py-3 px-4">Linked Context</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Sub-Checks Status</th>
                  <th className="py-3 px-4 text-center">PMT Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {items.map((rec) => {
                  const statusInfo = STATUS_BADGES[rec.status] || STATUS_BADGES.PENDING;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/dashboard/verification/${rec.id}`)}
                    >
                      {/* Code & Verifier */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {rec.verificationCode}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <span>{rec.verifierName}</span>
                          <span>•</span>
                          <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Beneficiary */}
                      <td className="py-3.5 px-4">
                        {rec.beneficiary ? (
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span>{rec.beneficiary.name}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              {rec.beneficiary.cnic || "No CNIC"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </td>

                      {/* Linked Context */}
                      <td className="py-3.5 px-4">
                        {rec.caseItem ? (
                          <Badge variant="outline" className="text-[11px] gap-1 font-mono bg-blue-50/50 text-blue-700 border-blue-200">
                            <Briefcase className="h-3 w-3" />
                            {rec.caseItem.caseNumber || "Case"}
                          </Badge>
                        ) : rec.application ? (
                          <Badge variant="outline" className="text-[11px] gap-1 font-mono bg-emerald-50/50 text-emerald-700 border-emerald-200">
                            <FileText className="h-3 w-3" />
                            {rec.application.applicationCode}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Direct Beneficiary Check</span>
                        )}
                      </td>

                      {/* Overall Status */}
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={`gap-1.5 py-1 px-2.5 font-semibold text-[11px] ${statusInfo.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusInfo.label}
                        </Badge>
                      </td>

                      {/* Sub-Checks Pills */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${CHECK_BADGES[rec.identityStatus]?.color}`}>
                            ID: {rec.identityStatus}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${CHECK_BADGES[rec.documentStatus]?.color}`}>
                            Doc: {rec.documentStatus}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${CHECK_BADGES[rec.householdStatus]?.color}`}>
                            House: {rec.householdStatus}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${CHECK_BADGES[rec.incomeStatus]?.color}`}>
                            Income: {rec.incomeStatus}
                          </span>
                        </div>
                      </td>

                      {/* PMT Score */}
                      <td className="py-3.5 px-4 text-center">
                        <div className={`inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full text-xs ${
                          rec.overallScore >= 70
                            ? "bg-emerald-100 text-emerald-800"
                            : rec.overallScore >= 40
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {rec.overallScore}/100
                        </div>
                      </td>

                      {/* Action Link */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/dashboard/verification/${rec.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <span>Open Workbench</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border/50 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handleFilter("page", String(currentPage - 1))}
                className="text-xs h-8"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => handleFilter("page", String(currentPage + 1))}
                className="text-xs h-8"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <NewVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        options={options}
      />
    </Card>
  );
}
