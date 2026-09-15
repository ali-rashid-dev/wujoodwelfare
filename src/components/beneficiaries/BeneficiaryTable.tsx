"use client";

import React, { useEffect, useState, useTransition } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Edit,
  Trash2,
  Phone,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  FileText,
  FilterX,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { deleteBeneficiary, setBeneficiarySearch, updateBeneficiaryStatus } from "@/app/(dashboard)/dashboard/beneficiaries/beneficiaries";
import { BeneficiaryStatus } from "@prisma/client";

export interface BeneficiaryItem {
  id: string;
  name: string;
  cnic?: string | null;
  gender?: string | null;
  status: BeneficiaryStatus | string;
  verifiedAt?: string | Date | null;
  registeredAt: string | Date;
  contact?: {
    phone?: string | null;
    phone2?: string | null;
    whatsapp?: string | null;
    email?: string | null;
  } | null;
  address?: {
    city?: string | null;
    province?: string | null;
    street?: string | null;
  } | null;
  _count?: {
    documents: number;
    cases: number;
    assistanceHistory: number;
  };
}

interface BeneficiaryTableProps {
  initialSearch: string;
  initialData: {
    items: BeneficiaryItem[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export function BeneficiaryTable({ initialData, initialSearch }: BeneficiaryTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const statusFilter = searchParams.get("status") ?? "ALL";
  const genderFilter = searchParams.get("gender") ?? "ALL";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void setBeneficiarySearch(search).then(() => router.refresh());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [search, router]);

  // AlertDialog State
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateFilters = (next: { status?: string; gender?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("search");
    const values = {
      status: next.status ?? statusFilter,
      gender: next.gender ?? genderFilter,
    };
    for (const [key, value] of Object.entries(values)) {
      if (!value || value === "ALL") params.delete(key);
      else params.set(key, value);
    }
    router.push(`/dashboard/beneficiaries?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const clearFilters = () => {
    setSearch("");
    updateFilters({ status: "ALL", gender: "ALL" });
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const res = await deleteBeneficiary(deleteCandidate.id);
      if (res.success) {
        toast.success(`Beneficiary ${deleteCandidate.name} deleted successfully.`);
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || "Failed to delete beneficiary");
      }
    } catch {
      toast.error("An error occurred while deleting the beneficiary.");
    } finally {
      setIsDeleting(false);
      setDeleteCandidate(null);
    }
  };

  const handleStatusUpdate = async (id: string, name: string, status: BeneficiaryStatus, isVerified?: boolean) => {
    try {
      const res = await updateBeneficiaryStatus(id, status, isVerified);
      if (res.success) {
        toast.success(`Updated status for ${name}`);
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "ALL" || genderFilter !== "ALL";

  return (
    <div className="space-y-4">
      {/* Controls Header & Quick Filters */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, CNIC, phone, or city..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9 pr-8 bg-background border-border"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Filters & Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(val) => { const value = val || "ALL"; updateFilters({ status: value }); }}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Gender Filter */}
              <Select value={genderFilter} onValueChange={(val) => { const value = val || "ALL"; updateFilters({ gender: value }); }}>
                <SelectTrigger className="w-[130px] text-xs h-9">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Genders</SelectItem>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1">
                  <FilterX className="w-3.5 h-3.5" /> Clear
                </Button>
              )}

              <Link
                href="/dashboard/beneficiaries/new"
                className={buttonVariants({ variant: "default", size: "sm", className: "h-9 text-xs gap-1.5 font-semibold" })}
              >
                <Plus className="w-4 h-4" />
                Add Beneficiary
              </Link>
            </div>
          </div>

          {/* Status Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
            <span className="text-muted-foreground font-medium text-[11px] shrink-0 mr-1">Quick Filter:</span>
              {[
              { id: "ALL", label: "All" },
              { id: "ACTIVE", label: "Active" },
              { id: "VERIFIED", label: "Verified" },
              { id: "PENDING", label: "Pending" },
              { id: "INACTIVE", label: "Inactive" },
            ].map((chip) => (
              <Button
                key={chip.id}
                variant={statusFilter === chip.id ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilters({ status: chip.id })}
                className="h-7 text-[11px] px-2.5 rounded-full shrink-0 font-normal"
              >
                {chip.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main View: Desktop Table & Mobile Cards */}
      <Card className="border-border shadow-xs overflow-hidden">
        {/* DESKTOP TABLE VIEW (md and up) */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold">Beneficiary</TableHead>
                <TableHead className="font-semibold">Contact & Location</TableHead>
                <TableHead className="font-semibold">Status & Verification</TableHead>
                <TableHead className="font-semibold">Records</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-foreground">No beneficiaries found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search terms or filters, or add a new beneficiary.
                    </p>
                    <div className="mt-4">
                      <Link
                        href="/dashboard/beneficiaries/new"
                        className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs gap-1.5" })}
                      >
                        <Plus className="w-3.5 h-3.5" /> Register Beneficiary
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                initialData.items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {getInitials(item.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/beneficiaries/${item.id}`}
                            className="font-semibold text-sm text-foreground hover:text-primary hover:underline block truncate"
                          >
                            {item.name}
                          </Link>
                          {item.cnic && (
                            <span className="text-xs text-muted-foreground font-mono block">
                              CNIC: {item.cnic}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        {item.contact?.phone && (
                          <div className="flex items-center gap-1.5 text-foreground">
                            <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span>{item.contact.phone}</span>
                          </div>
                        )}
                        {item.address?.city && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>
                              {item.address.city}
                              {item.address.province ? `, ${item.address.province}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={item.status} isVerified={Boolean(item.verifiedAt)} />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          {item._count?.assistanceHistory || 0} Aid Record{(item._count?.assistanceHistory || 0) !== 1 && "s"}
                        </Badge>
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {item._count?.documents || 0} Doc{(item._count?.documents || 0) !== 1 && "s"}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/beneficiaries/${item.id}`)} className="gap-2 cursor-pointer">
                            <Eye className="w-4 h-4 text-primary" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/beneficiaries/${item.id}/edit`)} className="gap-2 cursor-pointer">
                            <Edit className="w-4 h-4 text-amber-500" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">
                            Set Status
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(item.id, item.name, BeneficiaryStatus.ACTIVE)}
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Mark Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(item.id, item.name, BeneficiaryStatus.VERIFIED, true)}
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Verify Beneficiary
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(item.id, item.name, BeneficiaryStatus.INACTIVE)}
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 text-rose-500" /> Mark Inactive
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteCandidate({ id: item.id, name: item.name })}
                            className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" /> Delete Beneficiary
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* MOBILE CARD GRID VIEW (< md) */}
        <div className="block md:hidden divide-y divide-border">
          {initialData.items.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-foreground">No beneficiaries found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search terms or filters.
              </p>
            </div>
          ) : (
            initialData.items.map((item) => (
              <div key={item.id} className="p-4 space-y-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {getInitials(item.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/dashboard/beneficiaries/${item.id}`}
                        className="font-bold text-sm text-foreground hover:text-primary block"
                      >
                        {item.name}
                      </Link>
                      {item.cnic && (
                        <span className="text-xs text-muted-foreground font-mono block">
                          CNIC: {item.cnic}
                        </span>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted">
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/beneficiaries/${item.id}`)} className="gap-2 cursor-pointer">
                        <Eye className="w-4 h-4 text-primary" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/beneficiaries/${item.id}/edit`)} className="gap-2 cursor-pointer">
                        <Edit className="w-4 h-4 text-amber-500" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteCandidate({ id: item.id, name: item.name })}
                        className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                  <StatusBadge status={item.status} isVerified={Boolean(item.verifiedAt)} />

                  <div className="flex items-center gap-2">
                    {item.contact?.phone && (
                      <a
                        href={`tel:${item.contact.phone}`}
                        className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 w-7 p-0 rounded-full" })}
                        title="Call Beneficiary"
                      >
                        <Phone className="w-3.5 h-3.5 text-primary" />
                      </a>
                    )}
                    {item.contact?.whatsapp && (
                      <a
                        href={`https://wa.me/${item.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 w-7 p-0 rounded-full border-emerald-500/30 text-emerald-600" })}
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  {item.address?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {item.address.city}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-blue-500" />
                    {item._count?.assistanceHistory || 0} Aid Records
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border text-xs text-muted-foreground bg-muted/20">
          <div>
            Showing <span className="font-semibold text-foreground">{initialData.items.length}</span> of{" "}
            <span className="font-semibold text-foreground">{initialData.total}</span> beneficiaries
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={initialData.page <= 1}
              onClick={() => { const params = new URLSearchParams(searchParams.toString()); params.set("page", String(initialData.page - 1)); router.push(`/dashboard/beneficiaries?${params.toString()}`); }}
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
              onClick={() => { const params = new URLSearchParams(searchParams.toString()); params.set("page", String(initialData.page + 1)); router.push(`/dashboard/beneficiaries?${params.toString()}`); }}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Beneficiary Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteCandidate?.name}</strong>? This action cannot be undone and will delete all associated aid history, verification documents, and active cases.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Beneficiary"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
