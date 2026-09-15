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
  Users,
  Shield,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FilterX,
  UserCheck,
  Building2,
  FileCheck,
} from "lucide-react";
import { deleteStaff } from "@/app/(dashboard)/dashboard/staff/staff-actions";

export interface StaffItem {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string | null;
  designation: string;
  role: string;
  department: string;
  status: string;
  permissions: string[];
  joinedAt: string;
  _count?: {
    assignedCases: number;
    activities: number;
  };
}

interface StaffTableProps {
  initialItems: StaffItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  stats: {
    total: number;
    active: number;
    fieldOfficers: number;
    caseManagers: number;
  };
}

export function StaffTable({
  initialItems,
  totalItems,
  currentPage,
  totalPages,
  stats,
}: StaffTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [role, setRole] = useState(searchParams.get("role") || "ALL");
  const [department, setDepartment] = useState(searchParams.get("department") || "ALL");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");

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
      router.push(`/dashboard/staff?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search, role, department, status });
  };

  const handleClearFilters = () => {
    setSearch("");
    setRole("ALL");
    setDepartment("ALL");
    setStatus("ALL");
    startTransition(() => {
      router.push("/dashboard/staff");
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await deleteStaff(deleteId);
      if (res.success) {
        toast.success("Staff member deleted successfully");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete staff member");
      }
    } catch {
      toast.error("An error occurred during deletion");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case "ADMIN":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">Admin</Badge>;
      case "CASE_MANAGER":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Case Manager</Badge>;
      case "FIELD_OFFICER":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Field Officer</Badge>;
      case "VOLUNTEER_COORDINATOR":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Volunteer Coord.</Badge>;
      case "FINANCE_OFFICER":
        return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-200">Finance</Badge>;
      default:
        return <Badge variant="outline">{r}</Badge>;
    }
  };

  const getDepartmentLabel = (dept: string) => {
    switch (dept) {
      case "FIELD_OPERATIONS":
        return "Field Operations";
      case "CASE_MANAGEMENT":
        return "Case Management";
      case "HEALTH_SERVICES":
        return "Health Services";
      case "EDUCATION":
        return "Education Relief";
      case "LOGISTICS_RELIEF":
        return "Logistics & Emergency";
      case "FINANCE_ADMIN":
        return "Finance & Admin";
      default:
        return dept;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Active</Badge>;
      case "ON_LEAVE":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">On Leave</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-red-500/10 text-red-600 border-red-200">Suspended</Badge>;
      case "TERMINATED":
        return <Badge variant="secondary">Terminated</Badge>;
      default:
        return <Badge variant="outline">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Staff & Team Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage organization staff profiles, role permissions, assigned cases, and field activities.
          </p>
        </div>

        <Link
          href="/dashboard/staff/new"
          className={buttonVariants({ size: "sm", className: "gap-1.5 shadow-sm" })}
        >
          <Plus className="h-4 w-4" />
          Onboard New Staff
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Staff
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{stats.total}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Active Staff
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Field Officers
              </p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.fieldOfficers}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Case Managers
              </p>
              <h3 className="text-2xl font-bold text-purple-600 mt-1">{stats.caseManagers}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Shield className="h-5 w-5" />
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
                placeholder="Search staff by name, email, ID, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <NativeSelect
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  applyFilters({ search, role: e.target.value, department, status });
                }}
                className="w-36 h-9 text-xs"
              >
                <NativeSelectOption value="ALL">All Roles</NativeSelectOption>
                <NativeSelectOption value="ADMIN">Admin</NativeSelectOption>
                <NativeSelectOption value="FIELD_OFFICER">Field Officer</NativeSelectOption>
                <NativeSelectOption value="CASE_MANAGER">Case Manager</NativeSelectOption>
                <NativeSelectOption value="VOLUNTEER_COORDINATOR">Volunteer Coord.</NativeSelectOption>
                <NativeSelectOption value="FINANCE_OFFICER">Finance Officer</NativeSelectOption>
              </NativeSelect>

              <NativeSelect
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  applyFilters({ search, role, department: e.target.value, status });
                }}
                className="w-40 h-9 text-xs"
              >
                <NativeSelectOption value="ALL">All Departments</NativeSelectOption>
                <NativeSelectOption value="FIELD_OPERATIONS">Field Operations</NativeSelectOption>
                <NativeSelectOption value="CASE_MANAGEMENT">Case Management</NativeSelectOption>
                <NativeSelectOption value="HEALTH_SERVICES">Health Services</NativeSelectOption>
                <NativeSelectOption value="EDUCATION">Education Relief</NativeSelectOption>
                <NativeSelectOption value="LOGISTICS_RELIEF">Logistics & Relief</NativeSelectOption>
                <NativeSelectOption value="FINANCE_ADMIN">Finance & Admin</NativeSelectOption>
              </NativeSelect>

              <NativeSelect
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  applyFilters({ search, role, department, status: e.target.value });
                }}
                className="w-32 h-9 text-xs"
              >
                <NativeSelectOption value="ALL">All Statuses</NativeSelectOption>
                <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
                <NativeSelectOption value="ON_LEAVE">On Leave</NativeSelectOption>
                <NativeSelectOption value="SUSPENDED">Suspended</NativeSelectOption>
                <NativeSelectOption value="TERMINATED">Terminated</NativeSelectOption>
              </NativeSelect>

              <Button type="submit" size="sm" variant="secondary" className="h-9 px-3 text-xs">
                Filter
              </Button>

              {(search || role !== "ALL" || department !== "ALL" || status !== "ALL") && (
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

      {/* Staff Table */}
      <Card className="shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Employee ID & Name</TableHead>
                <TableHead className="text-xs font-semibold">Designation & Department</TableHead>
                <TableHead className="text-xs font-semibold">Role</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Assigned Cases</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-36 text-center text-xs text-muted-foreground">
                    No staff members found matching your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                initialItems.map((staff) => (
                  <TableRow key={staff.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">{staff.name}</span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="font-mono text-primary/80">{staff.employeeId}</span>
                          <span>•</span>
                          <span>{staff.email}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{staff.designation}</span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {getDepartmentLabel(staff.department)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>{getRoleBadge(staff.role)}</TableCell>

                    <TableCell>{getStatusBadge(staff.status)}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-semibold">{staff._count?.assignedCases || 0}</span>
                        <span className="text-[11px] text-muted-foreground">active cases</span>
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
                            onClick={() => router.push(`/dashboard/staff/${staff.id}`)}
                            className="gap-2 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(staff.id)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Staff
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
            <span className="font-semibold">{totalPages}</span> ({totalItems} total staff)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isPending}
              onClick={() => applyFilters({ search, role, department, status, page: String(currentPage - 1) })}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isPending}
              onClick={() => applyFilters({ search, role, department, status, page: String(currentPage + 1) })}
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
              Delete Staff Member
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to remove this staff profile? This action will permanently remove their permissions and history.
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
