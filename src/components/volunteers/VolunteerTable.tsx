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
  Heart,
  Clock,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Target,
} from "lucide-react";
import { deleteVolunteer } from "@/app/(dashboard)/dashboard/volunteers/volunteer-actions";

export interface VolunteerItem {
  id: string;
  volunteerCode: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  skills: string[];
  availability: string;
  city?: string | null;
  totalHoursLogged: number;
  rating?: number | null;
  joinedAt: string;
  _count?: {
    campaignAssignments: number;
    activities: number;
  };
}

interface VolunteerTableProps {
  initialItems: VolunteerItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  stats: {
    total: number;
    active: number;
    totalHours: number;
    activeCampaigns: number;
  };
}

export function VolunteerTable({
  initialItems,
  totalItems,
  currentPage,
  totalPages,
  stats,
}: VolunteerTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [availability, setAvailability] = useState(searchParams.get("availability") || "ALL");
  const [skill, setSkill] = useState(searchParams.get("skill") || "ALL");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const applyFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set("page", "1");
    startTransition(() => {
      router.push(`/dashboard/volunteers?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search, status, availability, skill });
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setAvailability("ALL");
    setSkill("ALL");
    startTransition(() => {
      router.push("/dashboard/volunteers");
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await deleteVolunteer(deleteId);
      if (res.success) {
        toast.success("Volunteer deleted successfully");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete volunteer");
      }
    } catch {
      toast.error("An error occurred during deletion");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Active</Badge>;
      case "INTERVIEWED":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Interviewed</Badge>;
      case "APPLIED":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Applied</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500/10 text-red-600 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{st}</Badge>;
    }
  };

  const getAvailabilityBadge = (av: string) => {
    switch (av) {
      case "WEEKENDS":
        return <Badge variant="outline" className="bg-purple-500/5 text-purple-600 border-purple-200 text-[10px]">Weekends</Badge>;
      case "WEEKDAYS":
        return <Badge variant="outline" className="bg-indigo-500/5 text-indigo-600 border-indigo-200 text-[10px]">Weekdays</Badge>;
      case "EVENINGS":
        return <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-200 text-[10px]">Evenings</Badge>;
      case "FULL_TIME":
        return <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-200 text-[10px]">Full Time</Badge>;
      case "ON_CALL":
        return <Badge variant="outline" className="bg-rose-500/5 text-rose-600 border-rose-200 text-[10px]">On Call</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{av}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Volunteer Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Register community volunteers, manage skills, assign campaigns, and track logged service hours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/volunteers/campaigns"
            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}
          >
            <Target className="h-4 w-4" />
            Welfare Campaigns
          </Link>
          <Link
            href="/dashboard/volunteers/new"
            className={buttonVariants({ size: "sm", className: "gap-1.5 shadow-sm" })}
          >
            <Plus className="h-4 w-4" />
            Register Volunteer
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Volunteers
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{stats.total}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Heart className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Active Field Volunteers
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Hours Logged
              </p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.totalHours} hrs</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Active Campaigns
              </p>
              <h3 className="text-2xl font-bold text-purple-600 mt-1">{stats.activeCampaigns}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Target className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="shadow-xs">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search volunteer by name, email, ID, phone, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <NativeSelect
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  applyFilters({ search, status: e.target.value, availability, skill });
                }}
                className="w-32 h-9 text-xs"
              >
                <NativeSelectOption value="ALL">All Statuses</NativeSelectOption>
                <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
                <NativeSelectOption value="INTERVIEWED">Interviewed</NativeSelectOption>
                <NativeSelectOption value="APPLIED">Applied</NativeSelectOption>
                <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
                <NativeSelectOption value="REJECTED">Rejected</NativeSelectOption>
              </NativeSelect>

              <NativeSelect
                value={availability}
                onChange={(e) => {
                  setAvailability(e.target.value);
                  applyFilters({ search, status, availability: e.target.value, skill });
                }}
                className="w-36 h-9 text-xs"
              >
                <NativeSelectOption value="ALL">All Availability</NativeSelectOption>
                <NativeSelectOption value="WEEKENDS">Weekends</NativeSelectOption>
                <NativeSelectOption value="WEEKDAYS">Weekdays</NativeSelectOption>
                <NativeSelectOption value="EVENINGS">Evenings</NativeSelectOption>
                <NativeSelectOption value="FULL_TIME">Full Time</NativeSelectOption>
                <NativeSelectOption value="ON_CALL">On Call</NativeSelectOption>
              </NativeSelect>

              <Button type="submit" size="sm" variant="secondary" className="h-9 px-3 text-xs">
                Filter
              </Button>

              {(search || status !== "ALL" || availability !== "ALL" || skill !== "ALL") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <FilterX className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Volunteers Data Table */}
      <Card className="shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Volunteer Code & Name</TableHead>
                <TableHead className="text-xs font-semibold">Skills & Specializations</TableHead>
                <TableHead className="text-xs font-semibold">Availability</TableHead>
                <TableHead className="text-xs font-semibold">Location</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Hours Logged</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center text-xs text-muted-foreground">
                    No volunteers found matching your search filters.
                  </TableCell>
                </TableRow>
              ) : (
                initialItems.map((v) => (
                  <TableRow key={v.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">{v.name}</span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="font-mono text-primary/80">{v.volunteerCode}</span>
                          <span>•</span>
                          <span>{v.phone}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {v.skills.slice(0, 2).map((sk) => (
                          <Badge key={sk} variant="outline" className="text-[10px] bg-muted/40">
                            {sk}
                          </Badge>
                        ))}
                        {v.skills.length > 2 && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            +{v.skills.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{getAvailabilityBadge(v.availability)}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 text-primary/70" />
                        <span>{v.city || "Not specified"}</span>
                      </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(v.status)}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-semibold">{v.totalHoursLogged} hrs</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-40 text-xs">
                          <DropdownMenuLabel>Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/volunteers/${v.id}`)}
                            className="gap-2 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(v.id)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-muted-foreground">
            Showing Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span> ({totalItems} total volunteers)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isPending}
              onClick={() => applyFilters({ search, status, availability, skill, page: String(currentPage - 1) })}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isPending}
              onClick={() => applyFilters({ search, status, availability, skill, page: String(currentPage + 1) })}
              className="h-8 px-2.5 text-xs"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold text-destructive">
              Delete Volunteer Profile
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to remove this volunteer profile? This action will permanently remove their records and activity history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-xs"
            >
              {deleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
