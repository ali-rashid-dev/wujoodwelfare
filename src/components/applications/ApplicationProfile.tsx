"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  User,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  UserCheck,
  ShieldCheck,
  ExternalLink,
  History,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  deleteApplication,
  updateApplicationStatus,
  assignApplicationReviewer,
} from "@/app/(dashboard)/dashboard/applications/application-actions";
import { ApplicationStatus } from "@prisma/client";
import { toast } from "sonner";

interface ApplicationProfileProps {
  application: {
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
      email: string | null;
      status: string;
      registeredAt: string;
    };
    program: {
      id: string;
      name: string;
      code: string;
      assistanceType: string;
      requiredDocuments: string[];
      eligibilityCriteria: string | null;
    } | null;
    reviewer: {
      id: string;
      name: string;
      email: string;
      designation: string;
      department: string;
    } | null;
    logs: Array<{
      id: string;
      fromStatus: string | null;
      toStatus: string;
      notes: string | null;
      performedBy: string | null;
      timestamp: string;
    }>;
  };
  staffList: Array<{ id: string; name: string; designation: string; department: string }>;
}

const WORKFLOW_STEPS = [
  { status: "SUBMITTED", label: "1. Intake Submitted", icon: Clock },
  { status: "INITIAL_REVIEW", label: "2. Initial Review", icon: Search },
  { status: "VERIFICATION", label: "3. Field Verification", icon: UserCheck },
  { status: "ELIGIBILITY_ASSESSMENT", label: "4. Eligibility Assessment", icon: ShieldCheck },
  { status: "APPROVED", label: "5. Final Decision", icon: CheckCircle2 },
];

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  SUBMITTED: { label: "Submitted", badge: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  INITIAL_REVIEW: { label: "Initial Review", badge: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  VERIFICATION: { label: "Field Verification", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  ELIGIBILITY_ASSESSMENT: { label: "Eligibility Assessment", badge: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  APPROVED: { label: "Approved", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  REJECTED: { label: "Rejected", badge: "bg-destructive/10 text-destructive border-destructive/20" },
};

const PRIORITY_CONFIG: Record<string, { label: string; badge: string }> = {
  LOW: { label: "Low", badge: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
  MEDIUM: { label: "Medium", badge: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  HIGH: { label: "High", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  URGENT: { label: "URGENT", badge: "bg-destructive/10 text-destructive border-destructive/20 font-bold" },
};

export function ApplicationProfile({ application, staffList }: ApplicationProfileProps) {
  const router = useRouter();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notesInput, setNotesInput] = useState("");

  const statusCfg = STATUS_CONFIG[application.status] || STATUS_CONFIG.SUBMITTED;
  const priorityCfg = PRIORITY_CONFIG[application.priority] || PRIORITY_CONFIG.MEDIUM;

  const formatPKR = (amount: number | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStepIndex = (statusStr: string) => {
    if (statusStr === "REJECTED") return 4;
    return WORKFLOW_STEPS.findIndex((s) => s.status === statusStr);
  };

  const currentStepIndex = getStepIndex(application.status);

  const handleAdvanceStatus = async (targetStatus: ApplicationStatus) => {
    setSubmitting(true);
    const res = await updateApplicationStatus(application.id, {
      targetStatus,
      notes: notesInput || undefined,
    });
    setSubmitting(false);

    if (res.success) {
      toast.success(`Application stage updated to ${targetStatus.replace(/_/g, " ")}!`);
      setNotesInput("");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }

    setSubmitting(true);
    const res = await updateApplicationStatus(application.id, {
      targetStatus: "REJECTED",
      rejectionReason: rejectionReason.trim(),
      notes: notesInput || undefined,
    });
    setSubmitting(false);

    if (res.success) {
      toast.success("Application rejected.");
      setRejectModalOpen(false);
      setRejectionReason("");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to reject application");
    }
  };

  const handleAssignReviewer = async (reviewerId: string) => {
    const res = await assignApplicationReviewer(application.id, reviewerId);
    if (res.success) {
      toast.success("Reviewer assigned successfully!");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to assign reviewer");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete application "${application.applicationCode}"?`)) return;
    const res = await deleteApplication(application.id);
    if (res.success) {
      toast.success("Application deleted");
      router.push("/dashboard/applications");
    } else {
      toast.error(res.error || "Failed to delete application");
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/applications")}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Button>
      </div>

      {/* Main Header Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono text-xs bg-muted">
                  {application.applicationCode}
                </Badge>
                <Badge variant="outline" className={`text-xs ${priorityCfg.badge}`}>
                  Priority: {priorityCfg.label}
                </Badge>
                <Badge variant="outline" className={`text-xs font-semibold ${statusCfg.badge}`}>
                  {application.status === "REJECTED" ? "Rejected" : statusCfg.label}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
                Welfare Assistance Request for {application.beneficiary.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                Submitted on {new Date(application.submittedAt).toLocaleString()} • Target: {application.program ? application.program.name : "General Aid Request"}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/dashboard/applications/${application.id}/edit`)}
                className="text-xs gap-1.5"
              >
                <Edit className="h-4 w-4" /> Edit Details
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>

          {/* 5-STEP VISUAL WORKFLOW PROGRESS TRACKER */}
          <div className="pt-4 border-t border-border space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Workflow Processing Stages
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {WORKFLOW_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx < currentStepIndex || application.status === "APPROVED";
                const isCurrent = idx === currentStepIndex && application.status !== "REJECTED";
                const isRejected = application.status === "REJECTED" && idx === 4;

                let cardClass = "bg-muted/20 border-border text-muted-foreground";
                if (isCompleted) {
                  cardClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold";
                } else if (isCurrent) {
                  cardClass = "bg-primary/10 border-primary/40 text-primary font-bold shadow-xs";
                } else if (isRejected) {
                  cardClass = "bg-destructive/10 border-destructive/30 text-destructive font-semibold";
                }

                return (
                  <div
                    key={step.status}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-1 text-xs transition-colors ${cardClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Step {idx + 1}</span>
                      <StepIcon className="h-4 w-4 shrink-0" />
                    </div>
                    <span className="font-semibold text-xs leading-tight block">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WORKFLOW ACTION BAR & TRANSITION CONTROL */}
      {application.status !== "APPROVED" && application.status !== "REJECTED" && (
        <Card className="border-border shadow-xs bg-muted/20">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" /> Advance Workflow Stage & Reviewer Action
            </h3>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex-1">
                <Textarea
                  placeholder="Optional review notes / remarks for audit trail..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="text-xs min-h-[50px]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {application.status === "SUBMITTED" && (
                  <Button
                    size="sm"
                    onClick={() => handleAdvanceStatus("INITIAL_REVIEW")}
                    disabled={submitting}
                    className="text-xs gap-1.5 font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                    Pass Initial Review
                  </Button>
                )}

                {application.status === "INITIAL_REVIEW" && (
                  <Button
                    size="sm"
                    onClick={() => handleAdvanceStatus("VERIFICATION")}
                    disabled={submitting}
                    className="text-xs gap-1.5 font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                    Send for Field Verification
                  </Button>
                )}

                {application.status === "VERIFICATION" && (
                  <Button
                    size="sm"
                    onClick={() => handleAdvanceStatus("ELIGIBILITY_ASSESSMENT")}
                    disabled={submitting}
                    className="text-xs gap-1.5 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    Start Eligibility Assessment
                  </Button>
                )}

                {application.status === "ELIGIBILITY_ASSESSMENT" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleAdvanceStatus("APPROVED")}
                      disabled={submitting}
                      className="text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      Approve Application
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectModalOpen(true)}
                      disabled={submitting}
                      className="text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject Application
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection Banner Notice if REJECTED */}
      {application.status === "REJECTED" && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <h4 className="font-bold text-sm text-destructive flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Application Declined
            </h4>
            <p className="text-xs text-muted-foreground">
              Reason for rejection: <strong>{application.rejectionReason || "No specific reason provided."}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Applicant & Program Info */}
        <div className="space-y-6 md:col-span-1">
          {/* Beneficiary Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Beneficiary Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Full Name</span>
                <Link
                  href={`/dashboard/beneficiaries/${application.beneficiary.id}`}
                  className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  {application.beneficiary.name}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </Link>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">CNIC Number</span>
                <span className="font-mono text-foreground font-semibold">
                  {application.beneficiary.cnic || "N/A"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Phone Contact</span>
                <span className="text-foreground">{application.beneficiary.phone || "N/A"}</span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Account Verification Status</span>
                <Badge variant="outline" className="text-[10px] mt-0.5">
                  {application.beneficiary.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Program Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-600" /> Welfare Program Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {application.program ? (
                <>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Program Title</span>
                    <Link
                      href={`/dashboard/programs/${application.program.id}`}
                      className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {application.program.name}
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </Link>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Program Code</span>
                    <span className="font-mono text-foreground font-semibold">{application.program.code}</span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Assistance Category</span>
                    <span className="font-semibold text-primary">{application.program.assistanceType}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">General Assistance Request (No specific program attached).</p>
              )}
            </CardContent>
          </Card>

          {/* Reviewer Assignment Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-600" /> Assigned Staff Reviewer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {application.reviewer ? (
                <div>
                  <span className="font-bold text-foreground block text-sm">{application.reviewer.name}</span>
                  <span className="text-muted-foreground block text-[11px]">
                    {application.reviewer.designation} • {application.reviewer.department}
                  </span>
                </div>
              ) : (
                <p className="text-muted-foreground">No staff reviewer currently assigned.</p>
              )}

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Re-assign Reviewer:</span>
                <Select
                  value={application.reviewerId || ""}
                  onValueChange={(val) => val && handleAssignReviewer(val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select staff member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">
                        {s.name} ({s.designation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Hardship Reason, Documents, Audit Trail */}
        <div className="space-y-6 md:col-span-2">
          {/* Requested Aid & Narrative Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" /> Requested Assistance & Hardship Narrative
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-3.5 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Requested Amount (PKR)</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {formatPKR(application.requestedAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Requested Package / Items</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {application.requestedItems || "General aid package"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Hardship Reason & Background Story
                </h4>
                <div className="p-4 rounded-xl border border-border bg-card leading-relaxed text-foreground whitespace-pre-wrap">
                  {application.reason}
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Attached Supporting Documents ({application.documents?.length || 0})
                </h4>
                {application.documents && application.documents.length > 0 ? (
                  <div className="space-y-1.5">
                    {application.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-xs"
                      >
                        <span className="truncate text-foreground font-mono text-[11px]">{doc}</span>
                        {doc.startsWith("http") && (
                          <a
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 font-semibold text-[11px]"
                          >
                            Open Link <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No supporting document links attached.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Timeline Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" /> Application Workflow Audit Trail
              </CardTitle>
              <CardDescription className="text-xs">
                Timestamped history of stage transitions, reviewer notes, and decision logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {application.logs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No audit logs recorded yet.</p>
              ) : (
                <div className="space-y-4 border-l-2 border-primary/30 pl-4 text-xs ml-2">
                  {application.logs.map((log) => {
                    const toCfg = STATUS_CONFIG[log.toStatus] || STATUS_CONFIG.SUBMITTED;
                    return (
                      <div key={log.id} className="relative space-y-1">
                        <div className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <Badge variant="outline" className={`text-[10px] ${toCfg.badge}`}>
                              {toCfg.label}
                            </Badge>
                            {log.fromStatus && (
                              <span className="text-muted-foreground text-[11px]">
                                (from {log.fromStatus.replace(/_/g, " ")})
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {log.notes && <p className="text-muted-foreground bg-muted/30 p-2 rounded border border-border/50">{log.notes}</p>}
                        {log.performedBy && (
                          <span className="text-[10px] text-muted-foreground block">
                            By: <strong>{log.performedBy}</strong>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* REJECTION REASON MODAL DIALOG */}
      <Dialog open={rejectModalOpen} onOpenChange={(open) => !open && setRejectModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-destructive">
              <XCircle className="h-5 w-5" /> Reject Welfare Application
            </DialogTitle>
            <DialogDescription className="text-xs">
              Please specify the mandatory reason for declining application <strong className="text-foreground">{application.applicationCode}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRejectSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="reject-reason" className="text-xs font-semibold">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="e.g. Household monthly income exceeds threshold eligibility limit..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                className="text-xs min-h-[90px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRejectModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !rejectionReason.trim()}
                className="text-xs gap-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" /> Confirm Rejection
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
