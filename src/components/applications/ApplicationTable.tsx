"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  FileText,
  LayoutGrid,
  List,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Zap,
} from "lucide-react";
import { deleteApplication, updateApplicationStatus } from "@/app/(dashboard)/dashboard/applications/application-actions";
import { ApplicationStatus } from "@prisma/client";
import { toast } from "sonner";

interface ApplicationItem {
  id: string;
  applicationCode: string;
  beneficiaryId: string;
  programId: string | null;
  assistanceType: string;
  requestedAmount: number | null;
  requestedItems: string | null;
  reason: string;
  priority: string;
  status: string;
  documents: string[];
  reviewerId: string | null;
  reviewNotes: string | null;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  verifiedAt: string | null;
  assessedAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  beneficiary: {
    id: string;
    name: string;
    cnic: string | null;
    phone: string | null;
    status: string;
  };
  program: {
    id: string;
    name: string;
    code: string;
    assistanceType: string;
  } | null;
  reviewer: {
    id: string;
    name: string;
    designation: string;
  } | null;
}

interface ApplicationStats {
  total: number;
  submitted: number;
  initialReview: number;
  verification: number;
  eligibilityAssessment: number;
  approved: number;
  rejected: number;
  pending: number;
  urgentCount: number;
}

interface ApplicationTableProps {
  initialItems: ApplicationItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  stats: ApplicationStats;
  programsList: Array<{ id: string; name: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: React.ElementType }> = {
  SUBMITTED: { label: "Submitted", badge: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Clock },
  INITIAL_REVIEW: { label: "Initial Review", badge: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Search },
  VERIFICATION: { label: "Verification", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: UserCheck },
  ELIGIBILITY_ASSESSMENT: { label: "Assessment", badge: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", icon: ShieldCheck },
  APPROVED: { label: "Approved", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", badge: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; badge: string }> = {
  LOW: { label: "Low", badge: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
  MEDIUM: { label: "Medium", badge: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  HIGH: { label: "High", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  URGENT: { label: "URGENT", badge: "bg-destructive/10 text-destructive border-destructive/20 font-bold" },
};

const STAGE_NEXT: Record<string, ApplicationStatus> = {
  SUBMITTED: "INITIAL_REVIEW",
  INITIAL_REVIEW: "VERIFICATION",
  VERIFICATION: "ELIGIBILITY_ASSESSMENT",
  ELIGIBILITY_ASSESSMENT: "APPROVED",
};

export function ApplicationTable({
  initialItems,
  totalItems,
  currentPage,
  totalPages,
  stats,
  programsList,
}: ApplicationTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const priority = searchParams.get("priority") || "ALL";
  const programId = searchParams.get("programId") || "ALL";
  const [searchValue, setSearchValue] = useState(search);
  const [filterState, setFilterState] = useState({ search, status, priority, programId });
  const filterStateRef = useRef(filterState);
  const lastSearchSentRef = useRef<string | null>(null);

  const updateFilters = useCallback((newParams: Record<string, string | undefined>) => {
    const nextFilters = { ...filterStateRef.current, ...newParams };
    filterStateRef.current = nextFilters;
    setFilterState(nextFilters);
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(nextFilters).forEach(([key, val]) => {
      if (val && val !== "ALL" && val !== "") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    if (!Object.prototype.hasOwnProperty.call(newParams, "page")) {
      params.set("page", "1");
    }
    if (Object.prototype.hasOwnProperty.call(newParams, "search")) {
      lastSearchSentRef.current = newParams.search ?? "";
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextFilters = { search, status, priority, programId };
      filterStateRef.current = nextFilters;
      setFilterState(nextFilters);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [search, status, priority, programId]);

  useEffect(() => {
    if (lastSearchSentRef.current === search) {
      lastSearchSentRef.current = null;
      return;
    }
    const timeoutId = window.setTimeout(() => setSearchValue(search), 0);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (searchValue === search) return;
    const timeoutId = window.setTimeout(() => updateFilters({ search: searchValue }), 300);
    return () => window.clearTimeout(timeoutId);
  }, [search, searchValue, updateFilters]);

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete application "${code}"?`)) return;
    const res = await deleteApplication(id);
    if (res.success) {
      toast.success("Application deleted successfully");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete application");
    }
  };

  const handleAdvanceStage = async (id: string, currentStatus: string) => {
    const next = STAGE_NEXT[currentStatus];
    if (!next) return;
    const res = await updateApplicationStatus(id, {
      targetStatus: next,
      notes: `Advanced to ${next.replace(/_/g, " ")} from directory quick action.`,
    });
    if (res.success) {
      toast.success(`Application advanced to ${next.replace(/_/g, " ")}!`);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to advance stage");
    }
  };

  const formatPKR = (amount: number | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const pipelineStages: Array<{ status: string; label: string; count: number }> = [
    { status: "SUBMITTED", label: "1. Intake Submitted", count: stats.submitted },
    { status: "INITIAL_REVIEW", label: "2. Initial Review", count: stats.initialReview },
    { status: "VERIFICATION", label: "3. Verification", count: stats.verification },
    { status: "ELIGIBILITY_ASSESSMENT", label: "4. Assessment", count: stats.eligibilityAssessment },
    { status: "APPROVED", label: "5. Approved / Decided", count: stats.approved },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Welfare Applications & Workflow
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Structured 5-step application processing pipeline: Intake → Initial Review → Field Verification → Eligibility Assessment → Decision.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => router.push("/dashboard/applications/new")}
          className="text-xs gap-1.5 font-semibold shrink-0"
        >
          <Plus className="h-4 w-4" /> Submit Application
        </Button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Applications
              </span>
              <span className="text-xl font-bold text-foreground mt-0.5 block">{stats.total}</span>
              <span className="text-[10px] text-muted-foreground">All time intake</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                In Review Pipeline
              </span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                {stats.pending}
              </span>
              <span className="text-[10px] text-muted-foreground">Processing stages</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Approved
              </span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {stats.approved}
              </span>
              <span className="text-[10px] text-muted-foreground">Granted aid</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Rejected
              </span>
              <span className="text-xl font-bold text-destructive mt-0.5 block">{stats.rejected}</span>
              <span className="text-[10px] text-muted-foreground">Declined requests</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <XCircle className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Urgent Priority
              </span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                {stats.urgentCount}
              </span>
              <span className="text-[10px] text-muted-foreground">Emergency cases</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by application code, beneficiary name, CNIC, or reason..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Priority Filter */}
            <Select value={priority} onValueChange={(val) => updateFilters({ priority: val || undefined })}>
              <SelectTrigger className="w-full md:w-[170px] text-xs">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Priorities</SelectItem>
                <SelectItem value="LOW" className="text-xs">Low</SelectItem>
                <SelectItem value="MEDIUM" className="text-xs">Medium</SelectItem>
                <SelectItem value="HIGH" className="text-xs">High</SelectItem>
                <SelectItem value="URGENT" className="text-xs text-destructive font-semibold">URGENT</SelectItem>
              </SelectContent>
            </Select>

            {/* Program Filter */}
            <Select value={programId} onValueChange={(val) => updateFilters({ programId: val || undefined })}>
              <SelectTrigger className="w-full md:w-[200px] text-xs">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Programs</SelectItem>
                {programsList.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/30 shrink-0">
              <Button
                variant={viewMode === "kanban" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="h-8 px-2.5 text-xs gap-1"
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Pipeline
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 px-2.5 text-xs gap-1"
              >
                <List className="h-3.5 w-3.5" /> Table
              </Button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-border pt-2.5">
            {["ALL", "SUBMITTED", "INITIAL_REVIEW", "VERIFICATION", "ELIGIBILITY_ASSESSMENT", "APPROVED", "REJECTED"].map((s) => {
              const isSelected = status === s;
              return (
                <Button
                  key={s}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ status: s })}
                  className={`h-7 text-[11px] px-3 font-medium rounded-full shrink-0 ${
                    isSelected ? "shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s === "ALL" ? "All Stages" : s.replace(/_/g, " ")}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Listing View */}
      {initialItems.length === 0 ? (
        <Card className="border-border shadow-xs">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Welfare Applications Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mt-1 mb-6">
              No applications match your active search filters, or no welfare applications have been submitted yet.
            </p>
            <Button
              size="sm"
              onClick={() => router.push("/dashboard/applications/new")}
              className="text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Submit First Application
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "kanban" ? (
        /* KANBAN PIPELINE VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => {
            const stageItems = initialItems.filter((app) => {
              if (stage.status === "APPROVED") {
                return app.status === "APPROVED" || app.status === "REJECTED";
              }
              return app.status === stage.status;
            });

            return (
              <div key={stage.status} className="flex flex-col space-y-3 min-w-[240px] bg-muted/20 p-3 rounded-xl border border-border">
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <span>{stage.label}</span>
                  </h4>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-bold">
                    {stageItems.length}
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1">
                  {stageItems.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-muted-foreground border border-dashed border-border rounded-lg bg-card/50">
                      No applications in this stage
                    </div>
                  ) : (
                    stageItems.map((app) => {
                      const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
                      const priorityCfg = PRIORITY_CONFIG[app.priority] || PRIORITY_CONFIG.MEDIUM;
                      const hasNext = Boolean(STAGE_NEXT[app.status]);

                      return (
                        <Card key={app.id} className="border-border shadow-2xs hover:border-primary/40 transition-all bg-card">
                          <CardContent className="p-3 space-y-2.5">
                            {/* Header: Code & Priority */}
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-mono text-[10px] font-semibold text-primary">{app.applicationCode}</span>
                              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${priorityCfg.badge}`}>
                                {priorityCfg.label}
                              </Badge>
                            </div>

                            {/* Applicant & Program */}
                            <div>
                              <h5 className="font-bold text-xs text-foreground line-clamp-1 hover:text-primary transition-colors">
                                <Link href={`/dashboard/applications/${app.id}`}>{app.beneficiary.name}</Link>
                              </h5>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {app.program ? app.program.name : "General Aid Request"}
                              </p>
                            </div>

                            {/* Hardship Reason Snippet */}
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight bg-muted/30 p-1.5 rounded border border-border/50">
                              {app.reason}
                            </p>

                            {/* Amount & Status Badge */}
                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatPKR(app.requestedAmount)}
                              </span>
                              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${statusCfg.badge}`}>
                                {statusCfg.label}
                              </Badge>
                            </div>

                            {/* Quick Action Button */}
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                                className="h-6 text-[10px] px-2 text-primary gap-1"
                              >
                                View Details <ExternalLink className="h-2.5 w-2.5" />
                              </Button>

                              {hasNext && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleAdvanceStage(app.id, app.status)}
                                  className="h-6 text-[10px] px-2 gap-1 text-foreground hover:bg-primary/20"
                                >
                                  Advance <ArrowRight className="h-2.5 w-2.5" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border font-semibold">
                <tr>
                  <th className="p-3 pl-4">Application Code & Date</th>
                  <th className="p-3">Beneficiary</th>
                  <th className="p-3">Program / Assistance</th>
                  <th className="p-3">Requested Aid</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Workflow Stage</th>
                  <th className="p-3">Reviewer</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {initialItems.map((app) => {
                  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
                  const priorityCfg = PRIORITY_CONFIG[app.priority] || PRIORITY_CONFIG.MEDIUM;
                  const hasNext = Boolean(STAGE_NEXT[app.status]);

                  return (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 pl-4">
                        <div className="font-mono font-bold text-foreground">
                          <Link href={`/dashboard/applications/${app.id}`} className="hover:text-primary transition-colors">
                            {app.applicationCode}
                          </Link>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-foreground">
                          <Link href={`/dashboard/beneficiaries/${app.beneficiary.id}`} className="hover:text-primary">
                            {app.beneficiary.name}
                          </Link>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          CNIC: {app.beneficiary.cnic || "N/A"}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        {app.program ? app.program.name : "General Assistance"}
                      </td>
                      <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatPKR(app.requestedAmount)}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-[10px] ${priorityCfg.badge}`}>
                          {priorityCfg.label}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-[10px] font-medium ${statusCfg.badge}`}>
                          {statusCfg.label}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground font-medium">
                        {app.reviewer ? app.reviewer.name : "Unassigned"}
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {hasNext && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdvanceStage(app.id, app.status)}
                              className="h-7 text-xs text-primary"
                            >
                              Advance
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                            className="h-7 text-xs"
                          >
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end" className="text-xs w-40">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/applications/${app.id}/edit`)}>
                                <Edit className="h-3.5 w-3.5 mr-2" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(app.id, app.applicationCode)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>
            Page {currentPage} of {totalPages} ({totalItems} total applications)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateFilters({ page: String(currentPage - 1) })}
              className="text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateFilters({ page: String(currentPage + 1) })}
              className="text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
