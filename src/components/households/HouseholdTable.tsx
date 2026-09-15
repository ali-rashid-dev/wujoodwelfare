"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Trash2,
  Home,
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  FilterX,
  ShieldAlert,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { deleteHousehold } from "@/app/(dashboard)/dashboard/households/households";

export interface HouseholdItem {
  id: string;
  householdCode: string;
  name: string;
  monthlyIncome: number;
  totalMembers: number;
  dependents: number;
  elderlyCount: number;
  disabledCount: number;
  childrenCount: number;
  housingType?: string | null;
  vulnerabilityScore: number;
  vulnerabilityCategory: string;
  createdAt: string;
  headBeneficiary?: {
    id: string;
    name: string;
    cnic?: string | null;
    phone?: string | null;
  } | null;
  _count?: {
    members: number;
    documents: number;
  };
}

interface HouseholdTableProps {
  initialData: {
    items: HouseholdItem[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export function HouseholdTable({ initialData }: HouseholdTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const categoryFilter = searchParams.get("category") || "ALL";

  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateFilters = (next: { category?: string; search?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    const category = next.category ?? categoryFilter;
    const q = next.search !== undefined ? next.search : search;

    if (!category || category === "ALL") params.delete("category");
    else params.set("category", category);

    if (!q || q.trim() === "") params.delete("search");
    else params.set("search", q.trim());

    router.push(`/dashboard/households?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    router.push("/dashboard/households");
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const res = await deleteHousehold(deleteCandidate.id);
      if (res.success) {
        toast.success(`Household ${deleteCandidate.name} deleted successfully.`);
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || "Failed to delete household");
      }
    } catch {
      toast.error("An error occurred while deleting household");
    } finally {
      setIsDeleting(false);
      setDeleteCandidate(null);
    }
  };

  const getVulnerabilityBadge = (category: string, score: number) => {
    switch (category) {
      case "CRITICAL":
        return (
          <Badge variant="destructive" className="gap-1 bg-rose-600 dark:bg-rose-500 font-semibold text-[11px]">
            <ShieldAlert className="w-3 h-3" /> Critical ({score}/100)
          </Badge>
        );
      case "HIGH":
        return (
          <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold text-[11px]">
            <AlertTriangle className="w-3 h-3" /> High Need ({score}/100)
          </Badge>
        );
      case "MODERATE":
        return (
          <Badge variant="outline" className="gap-1 border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 font-normal text-[11px]">
            <HeartHandshake className="w-3 h-3" /> Moderate ({score}/100)
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground font-normal text-[11px]">
            <ShieldCheck className="w-3 h-3" /> Low ({score}/100)
          </Badge>
        );
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
    <div className="space-y-4">
      {/* Controls & Search Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by code, household name, or head CNIC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && updateFilters({ search })}
                className="pl-9 pr-8 bg-background border-border"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    updateFilters({ search: "" });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdown & Action */}
            <div className="flex items-center gap-2 flex-wrap">
              <NativeSelect
                value={categoryFilter}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-[160px]"
              >
                <NativeSelectOption value="ALL">All Vulnerabilities</NativeSelectOption>
                <NativeSelectOption value="CRITICAL">Critical Need</NativeSelectOption>
                <NativeSelectOption value="HIGH">High Need</NativeSelectOption>
                <NativeSelectOption value="MODERATE">Moderate Need</NativeSelectOption>
                <NativeSelectOption value="LOW">Low Need</NativeSelectOption>
              </NativeSelect>

              {(search || categoryFilter !== "ALL") && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1">
                  <FilterX className="w-3.5 h-3.5" /> Clear
                </Button>
              )}

              <Link
                href="/dashboard/households/new"
                className={buttonVariants({ variant: "default", size: "sm", className: "h-9 text-xs gap-1.5 font-semibold" })}
              >
                <Plus className="w-4 h-4" /> Add Household
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Household & Head</TableHead>
              <TableHead className="font-semibold">Family Breakdown</TableHead>
              <TableHead className="font-semibold">Housing & Income</TableHead>
              <TableHead className="font-semibold">Welfare Assessment</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Home className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-foreground">No households found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting search parameters or create a new household.
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/dashboard/households/new"
                      className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs gap-1.5" })}
                    >
                      <Plus className="w-3.5 h-3.5" /> Register Household
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              initialData.items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/households/${item.id}`}
                          className="font-bold text-sm text-foreground hover:text-primary hover:underline block truncate"
                        >
                          {item.name}
                        </Link>
                        <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5">
                          {item.householdCode}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground block">
                        Head: {item.headBeneficiary ? item.headBeneficiary.name : "Not Assigned"}
                        {item.headBeneficiary?.cnic && ` (${item.headBeneficiary.cnic})`}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <Badge variant="secondary" className="text-[11px] font-normal gap-1">
                        <Users className="w-3 h-3 text-primary" /> {item.totalMembers} Members
                      </Badge>
                      {item.dependents > 0 && (
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {item.dependents} Dep.
                        </Badge>
                      )}
                      {item.disabledCount > 0 && (
                        <Badge variant="destructive" className="text-[10px] font-semibold py-0 px-1">
                          {item.disabledCount} Disabled
                        </Badge>
                      )}
                      {item.elderlyCount > 0 && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400 py-0 px-1">
                          {item.elderlyCount} Elderly
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 text-xs">
                      <span className="font-semibold text-foreground block">
                        {formatPKR(item.monthlyIncome)} / mo
                      </span>
                      <span className="text-muted-foreground block text-[11px]">
                        Housing: {item.housingType || "Not specified"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {getVulnerabilityBadge(item.vulnerabilityCategory, item.vulnerabilityScore)}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/households/${item.id}`)}
                          className="gap-2 cursor-pointer text-xs"
                        >
                          <Eye className="w-4 h-4 text-primary" /> Welfare Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteCandidate({ id: item.id, name: item.name })}
                          className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Household
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border text-xs text-muted-foreground bg-muted/20">
          <div>
            Showing <span className="font-semibold text-foreground">{initialData.items.length}</span> of{" "}
            <span className="font-semibold text-foreground">{initialData.total}</span> households
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={initialData.page <= 1}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(initialData.page - 1));
                router.push(`/dashboard/households?${params.toString()}`);
              }}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-2 font-medium">
              Page {initialData.page} of {initialData.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={initialData.page >= initialData.totalPages}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(initialData.page + 1));
                router.push(`/dashboard/households?${params.toString()}`);
              }}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Household Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteCandidate?.name}</strong>? This action will remove all family member links and household documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Household"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
