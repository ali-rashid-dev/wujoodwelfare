"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  BookOpen,
  DollarSign,
  Users,
  LayoutGrid,
  List,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Sparkles,
  Loader2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { seedDefaultPrograms, deleteProgram } from "@/app/(dashboard)/dashboard/programs/program-actions";
import { toast } from "sonner";

interface ProgramItem {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  eligibilityCriteria: string | null;
  budget: number;
  spentBudget: number;
  startDate: string;
  endDate: string | null;
  status: string;
  assistanceType: string;
  requiredDocuments: string[];
  targetBeneficiaries: number | null;
  maxBeneficiaries: number | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    enrollments: number;
    disbursements: number;
  };
}

interface ProgramStats {
  totalPrograms: number;
  activePrograms: number;
  totalBudget: number;
  totalSpent: number;
  totalEnrollments: number;
}

interface ProgramTableProps {
  initialItems: ProgramItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  stats: ProgramStats;
}

const STATUS_VARIANTS: Record<string, { label: string; badge: string; icon: React.ElementType }> = {
  ACTIVE: { label: "Active", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  DRAFT: { label: "Draft", badge: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: Clock },
  PAUSED: { label: "Paused", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: AlertCircle },
  COMPLETED: { label: "Completed", badge: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", badge: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle },
};

const ASSISTANCE_TYPE_LABELS: Record<string, string> = {
  FOOD: "Food Assistance",
  MEDICAL: "Medical Assistance",
  EDUCATION: "Education Support",
  ORPHAN_SUPPORT: "Orphan Support",
  DISABILITY_SUPPORT: "Disability Support",
  EMERGENCY_RELIEF: "Emergency Relief",
  HOUSING: "Housing Support",
  MARRIAGE_ASSISTANCE: "Marriage Assistance",
  EMPLOYMENT_SUPPORT: "Employment Support",
  MONTHLY_FINANCIAL_AID: "Monthly Financial Aid",
  FINANCIAL: "General Financial Aid",
  CLOTHING: "Clothing Support",
  OTHER: "Other Support",
};

export function ProgramTable({
  initialItems,
  totalItems,
  currentPage,
  totalPages,
  stats,
}: ProgramTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [seeding, setSeeding] = useState(false);

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const assistanceType = searchParams.get("assistanceType") || "ALL";
  const [searchValue, setSearchValue] = useState(search);

  const updateFilters = useCallback((newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val && val !== "ALL" && val !== "") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    if (!Object.prototype.hasOwnProperty.call(newParams, "page")) {
      params.set("page", "1");
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSearchValue(search), 0);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (searchValue === search) return;
    const timeoutId = window.setTimeout(() => {
      updateFilters({ search: searchValue });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search, searchValue, updateFilters]);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    const res = await seedDefaultPrograms();
    setSeeding(false);
    if (res.success) {
      toast.success(`Successfully initialized ${res.count} central welfare programs!`);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to seed default programs");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const res = await deleteProgram(id);
    if (res.success) {
      toast.success("Program deleted successfully");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete program");
    }
  };

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Central Welfare Programs
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Central program configuration, budget tracking, eligibility rules, and aid distribution records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {initialItems.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              {seeding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              )}
              Initialize 10 Default Programs
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => router.push("/dashboard/programs/new")}
            className="text-xs gap-1.5 font-semibold"
          >
            <Plus className="h-4 w-4" /> Create Program
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Budget
              </span>
              <span className="text-xl font-bold text-foreground mt-1 block">
                {formatPKR(stats.totalBudget)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Allocated across all programs
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Disbursed Aid
              </span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {formatPKR(stats.totalSpent)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                {stats.totalBudget > 0
                  ? `${Math.round((stats.totalSpent / stats.totalBudget) * 100)}% budget utilized`
                  : "0% budget utilized"}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Active Programs
              </span>
              <span className="text-xl font-bold text-foreground mt-1 block">
                {stats.activePrograms} / {stats.totalPrograms}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Currently running campaigns
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Enrolled Beneficiaries
              </span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
                {stats.totalEnrollments}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Receiving program support
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs by name, code, or description..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Assistance Type Filter Dropdown */}
            <Select
              value={assistanceType}
              onValueChange={(val) => updateFilters({ assistanceType: val || undefined })}
            >
              <SelectTrigger className="w-full md:w-[220px] text-xs">
                <SelectValue placeholder="All Assistance Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Assistance Types</SelectItem>
                {Object.entries(ASSISTANCE_TYPE_LABELS).map(([k, label]) => (
                  <SelectItem key={k} value={k} className="text-xs">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/30">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-2.5 text-xs gap-1"
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-2.5 text-xs gap-1"
              >
                <List className="h-3.5 w-3.5" /> List
              </Button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-border pt-3">
            {["ALL", "ACTIVE", "DRAFT", "PAUSED", "COMPLETED", "CANCELLED"].map((s) => {
              const isSelected = status === s;
              return (
                <Button
                  key={s}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ status: s })}
                  className={`h-7 text-[11px] px-3 font-medium rounded-full ${
                    isSelected ? "shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s === "ALL" ? "All Statuses" : s}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Programs Listing */}
      {initialItems.length === 0 ? (
        <Card className="border-border shadow-xs">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Welfare Programs Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mt-1 mb-6">
              No central program configurations match your search filters, or no programs have been created yet.
            </p>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeedDefaults}
                disabled={seeding}
                className="text-xs gap-1.5"
              >
                {seeding ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                )}
                Initialize Default Programs
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/dashboard/programs/new")}
                className="text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Create Program
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {initialItems.map((prog) => {
            const statusConfig = STATUS_VARIANTS[prog.status] || STATUS_VARIANTS.ACTIVE;
            const StatusIcon = statusConfig.icon;
            const usagePercent = prog.budget > 0 ? Math.min(Math.round((prog.spentBudget / prog.budget) * 100), 100) : 0;

            return (
              <Card
                key={prog.id}
                className="border-border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between group"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Card Header: Code & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] bg-muted/50">
                      {prog.code}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={`text-[10px] gap-1 font-medium ${statusConfig.badge}`}>
                        <StatusIcon className="h-3 w-3" /> {statusConfig.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="text-xs w-40">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/programs/${prog.id}`)}>
                            <ExternalLink className="h-3.5 w-3.5 mr-2 text-primary" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/programs/${prog.id}/edit`)}>
                            <Edit className="h-3.5 w-3.5 mr-2" /> Edit Program
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(prog.id, prog.name)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Program
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      <Link href={`/dashboard/programs/${prog.id}`}>{prog.name}</Link>
                    </h3>
                    <p className="text-[11px] font-semibold text-primary/80 mt-0.5">
                      {ASSISTANCE_TYPE_LABELS[prog.assistanceType] || prog.assistanceType}
                    </p>
                  </div>

                  {/* Description */}
                  {prog.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {prog.description}
                    </p>
                  )}

                  {/* Budget Usage Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground text-[11px]">Spent vs Budget</span>
                      <span className="font-bold text-foreground text-[11px]">
                        {formatPKR(prog.spentBudget)} / {formatPKR(prog.budget)}
                      </span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                    <div className="text-[10px] text-right text-muted-foreground">
                      {usagePercent}% Disbursed
                    </div>
                  </div>

                  {/* Required Document Badges Preview */}
                  {prog.requiredDocuments && prog.requiredDocuments.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <FileCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {prog.requiredDocuments.slice(0, 3).map((doc) => (
                        <Badge key={doc} variant="secondary" className="text-[9px] py-0 px-1.5 font-normal">
                          {doc.replace(/_/g, " ")}
                        </Badge>
                      ))}
                      {prog.requiredDocuments.length > 3 && (
                        <span className="text-[9px] text-muted-foreground">
                          +{prog.requiredDocuments.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Beneficiaries & Date Info */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span><strong>{prog._count.enrollments}</strong> Enrolled</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(prog.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW TABLE */
        <Card className="border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border font-semibold">
                <tr>
                  <th className="p-3 pl-4">Program Code & Name</th>
                  <th className="p-3">Assistance Category</th>
                  <th className="p-3">Budget Utilization</th>
                  <th className="p-3">Enrolled</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {initialItems.map((prog) => {
                  const statusConfig = STATUS_VARIANTS[prog.status] || STATUS_VARIANTS.ACTIVE;
                  const usagePercent = prog.budget > 0 ? Math.min(Math.round((prog.spentBudget / prog.budget) * 100), 100) : 0;

                  return (
                    <tr key={prog.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 pl-4">
                        <div className="font-bold text-foreground">
                          <Link href={`/dashboard/programs/${prog.id}`} className="hover:text-primary transition-colors">
                            {prog.name}
                          </Link>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">{prog.code}</span>
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        {ASSISTANCE_TYPE_LABELS[prog.assistanceType] || prog.assistanceType}
                      </td>
                      <td className="p-3 min-w-[160px]">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span>{formatPKR(prog.spentBudget)}</span>
                          <span className="font-bold">{usagePercent}%</span>
                        </div>
                        <Progress value={usagePercent} className="h-1.5" />
                      </td>
                      <td className="p-3 font-semibold text-foreground">
                        {prog._count.enrollments} beneficiaries
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-[10px] font-medium ${statusConfig.badge}`}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/programs/${prog.id}`)}
                            className="h-7 text-xs text-primary"
                          >
                            Manage
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
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/programs/${prog.id}/edit`)}>
                                <Edit className="h-3.5 w-3.5 mr-2" /> Edit Program
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(prog.id, prog.name)}
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
            Page {currentPage} of {totalPages} ({totalItems} total programs)
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
