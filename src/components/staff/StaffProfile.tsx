"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  User,
  Shield,
  Briefcase,
  Building2,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Plus,
  ArrowLeft,
  FileCheck,
  History,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { assignCaseToStaff, getAvailableCasesForStaff, logStaffActivity } from "@/app/(dashboard)/dashboard/staff/staff-actions";
import { StaffForm } from "./StaffForm";

interface AssignedCase {
  id: string;
  roleInCase: string;
  assignedAt: string;
  status: string;
  notes?: string | null;
  caseItem: {
    id: string;
    title: string;
    description?: string | null;
    isOpen: boolean;
    openedAt: string;
    beneficiary: {
      id: string;
      name: string;
      cnic?: string | null;
      phone?: string | null;
    };
  };
}

interface ActivityLog {
  id: string;
  action: string;
  description?: string | null;
  targetType?: string | null;
  performedAt: string;
}

interface StaffProfileProps {
  staff: {
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
    emergencyContact?: string | null;
    notes?: string | null;
    assignedCases: AssignedCase[];
    activities: ActivityLog[];
  };
  availableCases: { id: string; title: string; beneficiaryName: string; beneficiaryCnic?: string | null }[];
  availableCasesTotalPages: number;
}

export function StaffProfile({ staff, availableCases: initialAvailableCases, availableCasesTotalPages: initialAvailableCasesTotalPages }: StaffProfileProps) {
  const router = useRouter();
  const [, startCaseTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("cases");

  // Assign Case Modal State
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [roleInCase, setRoleInCase] = useState("Primary Officer");
  const [assignNotes, setAssignNotes] = useState("");
  const [submittingCase, setSubmittingCase] = useState(false);
  const [availableCases, setAvailableCases] = useState(initialAvailableCases);
  const [caseSearch, setCaseSearch] = useState("");
  const [casePage, setCasePage] = useState(1);
  const [caseTotalPages, setCaseTotalPages] = useState(initialAvailableCasesTotalPages);

  // Log Activity Modal State
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [actionTitle, setActionTitle] = useState("");
  const [actionDesc, setActionDesc] = useState("");
  const [submittingActivity, setSubmittingActivity] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);

  const loadAvailableCases = (search: string, page: number) => {
    startCaseTransition(async () => {
      const result = await getAvailableCasesForStaff({ search, page, limit: 25 });
      setAvailableCases(result.items);
      setCasePage(result.page);
      setCaseTotalPages(result.totalPages);
    });
  };

  const handleAssignCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId) {
      toast.error("Please select a beneficiary case");
      return;
    }
    setSubmittingCase(true);
    try {
      const res = await assignCaseToStaff(staff.id, {
        caseId: selectedCaseId,
        roleInCase,
        notes: assignNotes,
      });
      if (res.success) {
        toast.success("Case assigned to staff member");
        setAssignDialogOpen(false);
        setSelectedCaseId("");
        setAssignNotes("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to assign case");
      }
    } catch {
      toast.error("Failed to assign case");
    } finally {
      setSubmittingCase(false);
    }
  };

  const handleLogActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim()) {
      toast.error("Please enter an activity title");
      return;
    }
    setSubmittingActivity(true);
    try {
      const res = await logStaffActivity(staff.id, {
        action: actionTitle,
        description: actionDesc,
      });
      if (res.success) {
        toast.success("Staff activity logged");
        setActivityDialogOpen(false);
        setActionTitle("");
        setActionDesc("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to log activity");
      }
    } catch {
      toast.error("Failed to log activity");
    } finally {
      setSubmittingActivity(false);
    }
  };

  if (isEditing) {
    return (
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(false)}
          className="mb-4 text-xs gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cancel Editing
        </Button>
        <StaffForm initialData={staff} isEditing={true} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/staff")}
          className="h-9 text-xs gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff Directory
        </Button>

        <Button
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-9 text-xs gap-1.5"
        >
          Edit Profile
        </Button>
      </div>

      {/* Staff Overview Banner */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xl shadow-inner">
                {staff.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">{staff.name}</h1>
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 font-mono text-xs">
                    {staff.employeeId}
                  </Badge>
                  <Badge
                    className={
                      staff.status === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }
                  >
                    {staff.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium text-white">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    {staff.designation}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {staff.department.replace("_", " ")}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {staff.email}
                  </span>
                  {staff.phone && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {staff.phone}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Joined: {new Date(staff.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              {staff.emergencyContact && (
                <span className="text-[11px] text-amber-300">
                  Emergency: {staff.emergencyContact}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions & Badges Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Granted Role & System Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1 text-xs">
            Role: {staff.role}
          </Badge>
          {staff.permissions.map((perm) => (
            <Badge key={perm} variant="outline" className="bg-muted/50 text-xs px-2.5 py-0.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 mr-1" />
              {perm.replace("_", " ")}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Main Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b pb-2">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="cases" className="text-xs gap-2">
              <FileCheck className="h-3.5 w-3.5" />
              Assigned Cases ({staff.assignedCases.length})
            </TabsTrigger>
            <TabsTrigger value="activities" className="text-xs gap-2">
              <History className="h-3.5 w-3.5" />
              Activity History ({staff.activities.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === "cases" && (
            <Button
              size="sm"
              onClick={() => setAssignDialogOpen(true)}
              className="h-8 text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Assign New Case
            </Button>
          )}

          {activeTab === "activities" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActivityDialogOpen(true)}
              className="h-8 text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Activity
            </Button>
          )}
        </div>

        {/* Tab 1: Assigned Cases */}
        <TabsContent value="cases" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {staff.assignedCases.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No welfare cases currently assigned to this staff member.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {staff.assignedCases.map((ac) => (
                    <div key={ac.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground">
                            {ac.caseItem.title}
                          </span>
                          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/30">
                            {ac.roleInCase}
                          </Badge>
                          <Badge className={ac.caseItem.isOpen ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
                            {ac.caseItem.isOpen ? "OPEN" : "CLOSED"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>Beneficiary: <strong className="text-foreground">{ac.caseItem.beneficiary.name}</strong></span>
                          {ac.caseItem.beneficiary.cnic && <span>• CNIC: {ac.caseItem.beneficiary.cnic}</span>}
                          {ac.caseItem.beneficiary.phone && <span>• Phone: {ac.caseItem.beneficiary.phone}</span>}
                        </div>
                      </div>

                      <div className="text-right text-xs text-muted-foreground">
                        <div>Assigned: {new Date(ac.assignedAt).toLocaleDateString()}</div>
                        <Link
                          href={`/dashboard/beneficiaries/${ac.caseItem.beneficiary.id}`}
                          className="text-primary hover:underline text-[11px] font-medium"
                        >
                          View Beneficiary Case →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Activity History */}
        <TabsContent value="activities" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {staff.activities.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No activity history recorded yet.
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-primary/20 space-y-6">
                  {staff.activities.map((act) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-4 w-4 rounded-full bg-primary border-2 border-background" />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{act.action}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(act.performedAt).toLocaleString()}
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-xs text-muted-foreground">{act.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Case Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAssignCaseSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Assign Beneficiary Case</DialogTitle>
              <DialogDescription className="text-xs">
                Select an open beneficiary case to assign to {staff.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-medium block mb-1">Select Case</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={caseSearch}
                    onChange={(e) => setCaseSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        loadAvailableCases(caseSearch, 1);
                      }
                    }}
                    placeholder="Search case or beneficiary"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => loadAvailableCases(caseSearch, 1)}>
                    Search
                  </Button>
                </div>
                <NativeSelect
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  required
                >
                  <NativeSelectOption value="">-- Select Open Case --</NativeSelectOption>
                  {availableCases.map((c) => (
                    <NativeSelectOption key={c.id} value={c.id}>
                      {c.title} ({c.beneficiaryName})
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                  <Button type="button" variant="ghost" size="sm" disabled={casePage <= 1} onClick={() => loadAvailableCases(caseSearch, casePage - 1)}>
                    Previous
                  </Button>
                  <span>Page {casePage} of {caseTotalPages}</span>
                  <Button type="button" variant="ghost" size="sm" disabled={casePage >= caseTotalPages} onClick={() => loadAvailableCases(caseSearch, casePage + 1)}>
                    Next
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Role in Case</label>
                <Input
                  value={roleInCase}
                  onChange={(e) => setRoleInCase(e.target.value)}
                  placeholder="e.g. Primary Officer, Inspector"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Notes / Instructions</label>
                <Input
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g., Conduct field audit and document inspection"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submittingCase}>
                {submittingCase ? "Assigning..." : "Assign Case"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleLogActivitySubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Log Staff Activity</DialogTitle>
              <DialogDescription className="text-xs">
                Record an action or field visit completed by {staff.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-medium block mb-1">Activity Title / Action</label>
                <Input
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  placeholder="e.g. Conducted Household Verification Visit"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Description & Findings</label>
                <Input
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  placeholder="Verified income level and food ration requirement"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setActivityDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submittingActivity}>
                {submittingActivity ? "Logging..." : "Save Activity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
