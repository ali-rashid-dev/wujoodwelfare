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
  Briefcase,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  CalendarClock,
  Shield,
  TrendingUp,
  FolderOpen,
} from "lucide-react";
import { deleteCase } from "@/app/(dashboard)/dashboard/cases/case-actions";
import { toast } from "sonner";

interface CaseItem {
  id: string;
  caseNumber: string;
  beneficiaryId: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  description: string | null;
  documents: string[];
  isOpen: boolean;
  nextFollowUpDate: string | null;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  beneficiary: {
    id: string;
    name: string;
    cnic: string | null;
    phone: string | null;
    status: string;
  };
  assignments: Array<{
    staffId: string;
    staff: { id: string; name: string; designation: string };
  }>;
  _count: { assessments: number; visits: number; notes: number };
}

interface CaseTableProps {
  initialItems: CaseItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  stats: {
    total: number;
    active: number;
    urgentCount: number;
    pendingFollowUp: number;
    closed: number;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  NEW: { label: "New", color: "bg-slate-100 text-slate-700 border-slate-200", icon: FolderOpen },
  ASSIGNED: { label: "Assigned", color: "bg-blue-100 text-blue-700 border-blue-200", icon: UserCheck },
  UNDER_ASSESSMENT: { label: "Under Assessment", color: "bg-violet-100 text-violet-700 border-violet-200", icon: Shield },
  VERIFICATION: { label: "Verification", color: "bg-amber-100 text-amber-700 border-amber-200", icon: CheckCircle2 },
  DECISION: { label: "Decision", color: "bg-orange-100 text-orange-700 border-orange-200", icon: TrendingUp },
  ASSISTANCE: { label: "Assistance", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  FOLLOW_UP: { label: "Follow-up", color: "bg-cyan-100 text-cyan-700 border-cyan-200", icon: CalendarClock },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-500 border-gray-200", icon: XCircle },
};

const PRIORITY_CONFIG: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = ["ALL", "NEW", "ASSIGNED", "UNDER_ASSESSMENT", "VERIFICATION", "DECISION", "ASSISTANCE", "FOLLOW_UP", "CLOSED"];
const PRIORITY_OPTIONS = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];

export function CaseTable({ initialItems, totalItems, currentPage, totalPages, stats }: CaseTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "ALL");
  const [priority, setPriority] = useState(searchParams.get("priority") ?? "ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [items, setItems] = useState(initialItems);
  const hasMountedSearchRef = useRef(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setItems(initialItems), 0);
    return () => window.clearTimeout(timeoutId);
  }, [initialItems]);

  const updateSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set("search", search);
    if (status && status !== "ALL") params.set("status", status);
    if (priority && priority !== "ALL") params.set("priority", priority);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [search, status, priority, router, pathname, searchParams]);

  useEffect(() => {
    if (!hasMountedSearchRef.current) {
      hasMountedSearchRef.current = true;
      return;
    }
    const handler = setTimeout(() => {
      updateSearch();
    }, 400);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleStatusChange = (val: string) => {
    setStatus(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val !== "ALL") params.set("status", val);
    else params.delete("status");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriorityChange = (val: string) => {
    setPriority(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val !== "ALL") params.set("priority", val);
    else params.delete("priority");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete case "${title}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    const res = await deleteCase(id);
    setDeletingId(null);
    if (res.success) {
      toast.success("Case deleted.");
      setItems((prev) => prev.filter((c) => c.id !== id));
    } else {
      toast.error(res.error ?? "Failed to delete case.");
    }
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Case Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage welfare cases from opening through assessment to closure.
          </p>
        </div>
        <Link href="/dashboard/cases/new">
          <Button size="sm" className="gap-1.5 font-semibold text-xs">
            <Plus className="h-3.5 w-3.5" /> Open New Case
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Cases", value: stats.total, icon: Briefcase, color: "text-primary" },
          { label: "Active Cases", value: stats.active, icon: FolderOpen, color: "text-blue-600" },
          { label: "Urgent", value: stats.urgentCount, icon: AlertTriangle, color: "text-red-600" },
          { label: "Follow-ups Due", value: stats.pendingFollowUp, icon: CalendarClock, color: "text-violet-600" },
          { label: "Closed", value: stats.closed, icon: CheckCircle2, color: "text-emerald-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-0 shadow-sm bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`rounded-lg p-2 bg-muted ${s.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                  <p className="text-xl font-bold leading-tight">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 flex flex-col sm:flex-row gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search cases, beneficiaries, CNIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>

          <Select value={status} onValueChange={(value) => value && handleStatusChange(value)}>
            <SelectTrigger className="w-[170px] text-xs h-9">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s === "ALL" ? "All Statuses" : STATUS_CONFIG[s]?.label ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={(value) => value && handlePriorityChange(value)}>
            <SelectTrigger className="w-[150px] text-xs h-9">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p} value={p} className="text-xs">
                  {p === "ALL" ? "All Priorities" : p.charAt(0) + p.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table / List */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] items-center px-4 py-2 bg-muted/50 border-b text-xs font-semibold text-muted-foreground gap-3">
          <span className="w-[120px]">Case #</span>
          <span>Case Title & Beneficiary</span>
          <span className="w-[110px]">Category</span>
          <span className="w-[90px] text-center">Priority</span>
          <span className="w-[130px] text-center">Status</span>
          <span className="w-[80px] text-center">Activity</span>
          <span className="w-[40px]" />
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
            No cases found. Try adjusting filters or open a new case.
          </div>
        ) : (
          <div className="divide-y">
            {items.map((c) => {
              const statusCfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.NEW;
              const StatusIcon = statusCfg.icon;
              const isDel = deletingId === c.id;
              return (
                <div
                  key={c.id}
                  className="flex flex-col md:grid md:grid-cols-[auto_1fr_auto_auto_auto_auto_auto] items-start md:items-center px-4 py-3 gap-2 md:gap-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Case Number */}
                  <div className="w-full md:w-[120px]">
                    <Link href={`/dashboard/cases/${c.id}`}>
                      <span className="text-xs font-mono font-semibold text-primary hover:underline">
                        {c.caseNumber}
                      </span>
                    </Link>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(c.openedAt).toLocaleDateString("en-PK")}
                    </p>
                  </div>

                  {/* Title & Beneficiary */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/dashboard/cases/${c.id}`} className="group">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {c.title}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground truncate">
                        {c.beneficiary.name}
                        {c.beneficiary.cnic ? ` — ${c.beneficiary.cnic}` : ""}
                      </span>
                      {c.assignments.length > 0 && (
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">
                          · {c.assignments[0].staff.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="w-full md:w-[110px]">
                    <Badge variant="outline" className="text-[10px] font-normal capitalize">
                      {c.category.toLowerCase()}
                    </Badge>
                  </div>

                  {/* Priority */}
                  <div className="w-full md:w-[90px] md:text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                        PRIORITY_CONFIG[c.priority] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.priority === "URGENT" && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                      {c.priority}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="w-full md:w-[130px] md:text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.color}`}
                    >
                      <StatusIcon className="h-2.5 w-2.5" />
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Activity counts */}
                  <div className="hidden md:flex w-[80px] justify-center items-center gap-2">
                    <span className="text-[10px] text-muted-foreground" title="Assessments">
                      📋 {c._count.assessments}
                    </span>
                    <span className="text-[10px] text-muted-foreground" title="Visits">
                      🏠 {c._count.visits}
                    </span>
                    <span className="text-[10px] text-muted-foreground" title="Notes">
                      📝 {c._count.notes}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="md:w-[40px] self-start md:self-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem render={<Link href={`/dashboard/cases/${c.id}`} className="flex items-center gap-2" />}>
                          <ExternalLink className="h-3 w-3" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href={`/dashboard/cases/${c.id}/edit`} className="flex items-center gap-2" />}>
                          <Edit className="h-3 w-3" /> Edit Case
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(c.id, c.title)}
                          disabled={isDel}
                          className="text-destructive focus:text-destructive flex items-center gap-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          {isDel ? "Deleting..." : "Delete Case"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            Showing page {currentPage} of {totalPages} ({totalItems} total)
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (p > totalPages) return null;
              return (
                <Button
                  key={p}
                  variant={p === currentPage ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 w-8 px-0"
                  onClick={() => goToPage(p)}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
