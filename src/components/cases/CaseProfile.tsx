"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Edit,
  Trash2,
  UserCheck,
  CalendarClock,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FolderOpen,
  TrendingUp,
  FileText,
  MapPin,
  Phone,
  User,
  Clock,
  ChevronRight,
  PlusCircle,
  MessageSquare,
  Send,
  Loader2,
  MoreVertical,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { createVerificationRecord } from "@/app/(dashboard)/dashboard/verification/verification-actions";

import {
  updateCaseStatus,
  addCaseNote,
  assignCaseStaff,
  deleteCase,
} from "@/app/(dashboard)/dashboard/cases/case-actions";
import { AddAssessmentModal } from "@/components/cases/AddAssessmentModal";
import { LogVisitModal } from "@/components/cases/LogVisitModal";
import { ScheduleFollowUpModal } from "@/components/cases/ScheduleFollowUpModal";
import { toast } from "sonner";

interface CaseProfileProps {
  caseItem: {
    id: string;
    caseNumber: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    description: string | null;
    documents: string[];
    isOpen: boolean;
    openedAt: string;
    closedAt: string | null;
    closureReason: string | null;
    nextFollowUpDate: string | null;
    followUpPurpose: string | null;
    createdAt: string;
    updatedAt: string;
    beneficiary: {
      id: string;
      name: string;
      cnic: string | null;
      phone: string | null;
      status: string;
      registeredAt: string;
      family: { totalChildren: number } | null;
      economic: { monthlyIncome: number | null; employmentStatus: string | null } | null;
      address: { city: string | null; district: string | null; province: string | null } | null;
    };
    assignments: Array<{
      id: string;
      staffId: string;
      roleInCase: string;
      assignedAt: string;
      staff: { id: string; name: string; designation: string; department: string };
    }>;
    assessments: Array<{
      id: string;
      assessorName: string | null;
      vulnerabilityScore: number;
      financialNeedScore: number;
      recommendation: string;
      findings: string | null;
      createdAt: string;
    }>;
    visits: Array<{
      id: string;
      visitorName: string;
      visitDate: string;
      location: string | null;
      purpose: string;
      findings: string;
      outcome: string | null;
      createdAt: string;
    }>;
    notes: Array<{
      id: string;
      authorName: string;
      content: string;
      isInternal: boolean;
      createdAt: string;
    }>;
    logs: Array<{
      id: string;
      fromStatus: string | null;
      toStatus: string;
      action: string;
      details: string | null;
      performedBy: string | null;
      timestamp: string;
    }>;
  };
  staffList: Array<{ id: string; name: string; designation: string; department: string }>;
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

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const WORKFLOW_STEPS = [
  "NEW", "ASSIGNED", "UNDER_ASSESSMENT", "VERIFICATION", "DECISION", "ASSISTANCE", "FOLLOW_UP", "CLOSED",
];

export function CaseProfile({ caseItem, staffList }: CaseProfileProps) {
  const router = useRouter();
  const statusCfg = STATUS_CONFIG[caseItem.status] ?? STATUS_CONFIG.NEW;
  const StatusIcon = statusCfg.icon;

  const [activeTab, setActiveTab] = useState<"overview" | "assessments" | "visits" | "notes" | "history">("overview");
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [advancingStatus, setAdvancingStatus] = useState(false);
  const [closingCase, setClosingCase] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");

  const currentStepIndex = WORKFLOW_STEPS.indexOf(caseItem.status);
  const nextStatus = currentStepIndex < WORKFLOW_STEPS.length - 1 ? WORKFLOW_STEPS[currentStepIndex + 1] : null;

  const handleAdvanceStatus = async () => {
    if (!nextStatus) return;
    setAdvancingStatus(true);
    const res = await updateCaseStatus(caseItem.id, { targetStatus: nextStatus as "NEW" | "ASSIGNED" | "UNDER_ASSESSMENT" | "VERIFICATION" | "DECISION" | "ASSISTANCE" | "FOLLOW_UP" | "CLOSED" });
    setAdvancingStatus(false);
    if (res.success) {
      toast.success(`Case moved to ${STATUS_CONFIG[nextStatus]?.label ?? nextStatus}`);
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to advance status");
    }
  };

  const handleCloseCase = async () => {
    if (!confirm("Close this case? The case will be marked as resolved.")) return;
    setClosingCase(true);
    const res = await updateCaseStatus(caseItem.id, {
      targetStatus: "CLOSED",
      closureReason: "Case resolved and closed by case worker.",
    });
    setClosingCase(false);
    if (res.success) {
      toast.success("Case has been closed.");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to close case");
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim() || noteContent.length < 3) {
      toast.error("Please enter a note with at least 3 characters.");
      return;
    }
    setAddingNote(true);
    const res = await addCaseNote(caseItem.id, { content: noteContent, isInternal });
    setAddingNote(false);
    if (res.success) {
      toast.success("Note added successfully.");
      setNoteContent("");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to add note");
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffId) {
      toast.error("Please select a staff member.");
      return;
    }
    setAssigningStaff(true);
    const res = await assignCaseStaff(caseItem.id, selectedStaffId);
    setAssigningStaff(false);
    if (res.success) {
      toast.success("Staff member assigned to case.");
      setSelectedStaffId("");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to assign staff");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete this case? This cannot be undone.")) return;
    const res = await deleteCase(caseItem.id);
    if (res.success) {
      toast.success("Case deleted.");
      router.push("/dashboard/cases");
    } else {
      toast.error(res.error ?? "Failed to delete case");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight">{caseItem.title}</h1>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.color}`}
              >
                <StatusIcon className="h-2.5 w-2.5" />
                {statusCfg.label}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                  PRIORITY_COLOR[caseItem.priority] ?? "bg-slate-100 text-slate-600"
                }`}
              >
                {caseItem.priority === "URGENT" && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                {caseItem.priority}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {caseItem.caseNumber} · Opened{" "}
              {new Date(caseItem.openedAt).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {caseItem.assignments.length > 0 && ` · ${caseItem.assignments[0].staff.name}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 font-semibold text-primary border-primary/30 hover:bg-primary/5"
            onClick={async () => {
              const res = await createVerificationRecord({ caseId: caseItem.id, verifierName: "Verification Officer" });
              if (res.success && res.id) {
                toast.success(`Verification ${res.code} initiated!`);
                router.push(`/dashboard/verification/${res.id}`);
              } else {
                toast.error(res.error || "Failed to launch verification");
              }
            }}

          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Verification Audit
          </Button>

          {caseItem.isOpen && nextStatus && nextStatus !== "CLOSED" && (
            <Button
              size="sm"
              className="text-xs gap-1.5 font-semibold"
              onClick={handleAdvanceStatus}
              disabled={advancingStatus}
            >
              {advancingStatus ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              {advancingStatus ? "Advancing..." : `Move to ${STATUS_CONFIG[nextStatus]?.label}`}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem render={<Link href={`/dashboard/cases/${caseItem.id}/edit`} className="flex items-center gap-2" />}>
                <Edit className="h-3 w-3" /> Edit Case
              </DropdownMenuItem>
              {caseItem.isOpen && (
                <DropdownMenuItem
                  onClick={handleCloseCase}
                  disabled={closingCase}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-3 w-3" /> Close Case
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive flex items-center gap-2"
              >
                <Trash2 className="h-3 w-3" /> Delete Case
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Workflow Progress */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {WORKFLOW_STEPS.map((step, i) => {
              const cfg = STATUS_CONFIG[step];
              const Icon = cfg.icon;
              const isCurrent = step === caseItem.status;
              const isDone = i < currentStepIndex;
              return (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors shrink-0 ${
                      isCurrent
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : isDone
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                    {cfg.label}
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className={`h-px w-4 shrink-0 ${i < currentStepIndex ? "bg-emerald-400" : "bg-border"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Beneficiary & Case Details */}
        <div className="space-y-4">
          {/* Beneficiary Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Beneficiary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              <Link
                href={`/dashboard/beneficiaries/${caseItem.beneficiary.id}`}
                className="text-sm font-semibold hover:text-primary hover:underline transition-colors"
              >
                {caseItem.beneficiary.name}
              </Link>
              {caseItem.beneficiary.cnic && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" /> {caseItem.beneficiary.cnic}
                </p>
              )}
              {caseItem.beneficiary.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {caseItem.beneficiary.phone}
                </p>
              )}
              {caseItem.beneficiary.address && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[
                    caseItem.beneficiary.address.city,
                    caseItem.beneficiary.address.district,
                    caseItem.beneficiary.address.province,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {caseItem.beneficiary.family && (
                <p className="text-xs text-muted-foreground">
                  👨‍👩‍👧 {caseItem.beneficiary.family.totalChildren} children in family
                </p>
              )}
              {caseItem.beneficiary.economic?.monthlyIncome && (
                <p className="text-xs text-muted-foreground">
                  💰 PKR {caseItem.beneficiary.economic.monthlyIncome.toLocaleString()} / month
                </p>
              )}
            </CardContent>
          </Card>

          {/* Case Details */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" /> Case Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Category</span>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {caseItem.category.toLowerCase()}
                </Badge>
              </div>
              {caseItem.description && (
                <p className="text-xs text-muted-foreground border-t pt-2">{caseItem.description}</p>
              )}
              {caseItem.documents.length > 0 && (
                <div className="border-t pt-2">
                  <p className="text-xs font-medium mb-1">Required Documents</p>
                  <div className="flex flex-wrap gap-1">
                    {caseItem.documents.map((doc) => (
                      <span
                        key={doc}
                        className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {caseItem.nextFollowUpDate && (
                <div className="flex items-center gap-1.5 border-t pt-2 text-xs text-violet-700">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Follow-up:{" "}
                  {new Date(caseItem.nextFollowUpDate).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              )}
              {caseItem.closedAt && (
                <div className="flex items-center gap-1.5 border-t pt-2 text-xs text-muted-foreground">
                  <XCircle className="h-3.5 w-3.5 text-gray-400" />
                  Closed: {new Date(caseItem.closedAt).toLocaleDateString("en-PK")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" /> Case Officers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              {caseItem.assignments.length > 0 ? (
                <div className="space-y-2">
                  {caseItem.assignments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">{a.staff.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {a.staff.designation} · {a.roleInCase}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No case officer assigned yet.</p>
              )}

              {caseItem.isOpen && (
                <div className="border-t pt-2 space-y-2">
                  <Select value={selectedStaffId} onValueChange={(value) => setSelectedStaffId(value ?? "")}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Assign staff member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">
                          {s.name} — {s.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={handleAssignStaff}
                    disabled={!selectedStaffId || assigningStaff}
                  >
                    {assigningStaff ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                    Assign Officer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {caseItem.isOpen && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start gap-2"
                  onClick={() => setShowAssessmentModal(true)}
                >
                  <Shield className="h-3.5 w-3.5 text-violet-600" /> Add Assessment
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start gap-2"
                  onClick={() => setShowVisitModal(true)}
                >
                  <MapPin className="h-3.5 w-3.5 text-amber-600" /> Log Field Visit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start gap-2"
                  onClick={() => setShowFollowUpModal(true)}
                >
                  <CalendarClock className="h-3.5 w-3.5 text-cyan-600" /> Schedule Follow-up
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Tabbed Content Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Navigation */}
          <div className="flex gap-1 border-b pb-0">
            {(["overview", "assessments", "visits", "notes", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-semibold capitalize transition-all border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "overview"
                  ? "Overview"
                  : tab === "assessments"
                  ? `Assessments (${caseItem.assessments.length})`
                  : tab === "visits"
                  ? `Visits (${caseItem.visits.length})`
                  : tab === "notes"
                  ? `Notes (${caseItem.notes.length})`
                  : "Activity Log"}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Assessments", value: caseItem.assessments.length, icon: "📋", color: "text-violet-600" },
                    { label: "Field Visits", value: caseItem.visits.length, icon: "🏠", color: "text-amber-600" },
                    { label: "Notes", value: caseItem.notes.length, icon: "📝", color: "text-blue-600" },
                    { label: "Activity Logs", value: caseItem.logs.length, icon: "🔄", color: "text-emerald-600" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-2xl font-bold">{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {s.icon} {s.label}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {caseItem.assessments.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-semibold">Latest Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    {(() => {
                      const a = caseItem.assessments[0];
                      return (
                        <div className="space-y-2">
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">Vulnerability Score</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-orange-500 rounded-full"
                                    style={{ width: `${a.vulnerabilityScore}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold">{a.vulnerabilityScore}/100</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">Financial Need Score</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-red-500 rounded-full"
                                    style={{ width: `${a.financialNeedScore}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold">{a.financialNeedScore}/100</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs font-medium mt-2">Recommendation</p>
                          <p className="text-xs text-muted-foreground">{a.recommendation}</p>
                          <p className="text-[10px] text-muted-foreground">
                            By {a.assessorName} · {new Date(a.createdAt).toLocaleDateString("en-PK")}
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {caseItem.visits.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-semibold">Latest Field Visit</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    {(() => {
                      const v = caseItem.visits[0];
                      return (
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium">{v.purpose}</p>
                          {v.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {v.location}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">{v.findings}</p>
                          {v.outcome && (
                            <p className="text-xs italic text-emerald-700">Outcome: {v.outcome}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground">
                            By {v.visitorName} · {new Date(v.visitDate).toLocaleDateString("en-PK")}
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Assessments Tab */}
          {activeTab === "assessments" && (
            <div className="space-y-3">
              {caseItem.isOpen && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  onClick={() => setShowAssessmentModal(true)}
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Add Assessment
                </Button>
              )}
              {caseItem.assessments.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center text-xs text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No assessments recorded yet.
                  </CardContent>
                </Card>
              ) : (
                caseItem.assessments.map((a) => (
                  <Card key={a.id} className="border-0 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">Assessment by {a.assessorName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(a.createdAt).toLocaleDateString("en-PK")}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Vulnerability</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500 rounded-full"
                                style={{ width: `${a.vulnerabilityScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold w-10 text-right">{a.vulnerabilityScore}/100</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Financial Need</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500 rounded-full"
                                style={{ width: `${a.financialNeedScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold w-10 text-right">{a.financialNeedScore}/100</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-0.5">Recommendation</p>
                        <p className="text-xs text-muted-foreground">{a.recommendation}</p>
                      </div>
                      {a.findings && (
                        <div>
                          <p className="text-xs font-medium mb-0.5">Detailed Findings</p>
                          <p className="text-xs text-muted-foreground">{a.findings}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Visits Tab */}
          {activeTab === "visits" && (
            <div className="space-y-3">
              {caseItem.isOpen && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  onClick={() => setShowVisitModal(true)}
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Log Field Visit
                </Button>
              )}
              {caseItem.visits.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center text-xs text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No field visits logged yet.
                  </CardContent>
                </Card>
              ) : (
                caseItem.visits.map((v) => (
                  <Card key={v.id} className="border-0 shadow-sm">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{v.purpose}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(v.visitDate).toLocaleDateString("en-PK")}
                        </p>
                      </div>
                      {v.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {v.location}
                        </p>
                      )}
                      <div>
                        <p className="text-xs font-medium mb-0.5">Findings & Observations</p>
                        <p className="text-xs text-muted-foreground">{v.findings}</p>
                      </div>
                      {v.outcome && (
                        <p className="text-xs text-emerald-700 italic">Outcome: {v.outcome}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">Visited by {v.visitorName}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-3">
              {/* Add Note */}
              {caseItem.isOpen && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" /> Add Case Note
                    </Label>
                    <Textarea
                      placeholder="Write a case note, observation, or update..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="text-xs min-h-[80px]"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="note-internal"
                          checked={isInternal}
                          onCheckedChange={setIsInternal}
                          className="scale-75"
                        />
                        <Label htmlFor="note-internal" className="text-xs text-muted-foreground cursor-pointer">
                          Internal note
                        </Label>
                      </div>
                      <Button
                        size="sm"
                        className="text-xs gap-1.5"
                        onClick={handleAddNote}
                        disabled={addingNote || !noteContent.trim()}
                      >
                        {addingNote ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        {addingNote ? "Saving..." : "Add Note"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {caseItem.notes.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center text-xs text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No notes recorded yet.
                  </CardContent>
                </Card>
              ) : (
                caseItem.notes.map((n) => (
                  <Card key={n.id} className={`border-0 shadow-sm ${n.isInternal ? "border-l-2 border-l-amber-400" : ""}`}>
                    <CardContent className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{n.authorName}</p>
                        <div className="flex items-center gap-2">
                          {n.isInternal && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                              Internal
                            </span>
                          )}
                          <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(n.createdAt).toLocaleDateString("en-PK")}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{n.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === "history" && (
            <div className="space-y-2">
              {caseItem.logs.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center text-xs text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No activity recorded yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="relative pl-5 space-y-0">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                  {caseItem.logs.map((log) => (
                    <div key={log.id} className="relative pl-5 pb-4">
                      <div className="absolute left-[-7px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold">{log.action}</p>
                          {log.details && (
                            <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                          )}
                          {log.fromStatus && log.toStatus && log.fromStatus !== log.toStatus && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                                {STATUS_CONFIG[log.fromStatus]?.label ?? log.fromStatus}
                              </span>
                              <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                {STATUS_CONFIG[log.toStatus]?.label ?? log.toStatus}
                              </span>
                            </div>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-0.5">By {log.performedBy}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddAssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        caseId={caseItem.id}
        caseTitle={caseItem.title}
        onSuccess={() => router.refresh()}
      />
      <LogVisitModal
        isOpen={showVisitModal}
        onClose={() => setShowVisitModal(false)}
        caseId={caseItem.id}
        caseTitle={caseItem.title}
      />
      <ScheduleFollowUpModal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        caseId={caseItem.id}
        caseTitle={caseItem.title}
        currentFollowUpDate={caseItem.nextFollowUpDate}
      />
    </div>
  );
}
