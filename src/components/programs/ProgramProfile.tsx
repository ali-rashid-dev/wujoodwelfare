"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  DollarSign,
  Users,
  Calendar,
  FileCheck,
  UserPlus,
  HandHeart,
  TrendingUp,
  UserCheck,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { deleteProgram, removeBeneficiaryFromProgram } from "@/app/(dashboard)/dashboard/programs/program-actions";
import { EnrollBeneficiaryModal } from "./EnrollBeneficiaryModal";
import { DisburseAidModal } from "./DisburseAidModal";
import { toast } from "sonner";

interface ProgramProfileProps {
  program: {
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
    enrollments: Array<{
      id: string;
      programId: string;
      beneficiaryId: string;
      status: string;
      enrolledAt: string;
      approvedAt: string | null;
      notes: string | null;
      beneficiary: {
        id: string;
        name: string;
        cnic: string | null;
        phone: string | null;
        status: string;
      };
    }>;
    disbursements: Array<{
      id: string;
      beneficiaryId: string;
      programId: string | null;
      type: string;
      description: string | null;
      amount: number;
      quantity: string | null;
      givenAt: string;
      givenBy: string | null;
      beneficiary: {
        id: string;
        name: string;
        cnic: string | null;
      };
    }>;
  };
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

export function ProgramProfile({ program }: ProgramProfileProps) {
  const router = useRouter();
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [disburseModalOpen, setDisburseModalOpen] = useState(false);

  const statusConfig = STATUS_VARIANTS[program.status] || STATUS_VARIANTS.ACTIVE;
  const StatusIcon = statusConfig.icon;
  const usagePercent = program.budget > 0 ? Math.min(Math.round((program.spentBudget / program.budget) * 100), 100) : 0;

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRemoveEnrollment = async (enrollmentId: string, name: string) => {
    if (!confirm(`Remove ${name} from this program?`)) return;
    const res = await removeBeneficiaryFromProgram(enrollmentId, program.id);
    if (res.success) {
      toast.success("Beneficiary removed from program");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to remove beneficiary");
    }
  };

  const handleDeleteProgram = async () => {
    if (!confirm(`Are you sure you want to delete program "${program.name}"?`)) return;
    const res = await deleteProgram(program.id);
    if (res.success) {
      toast.success("Program deleted successfully");
      router.push("/dashboard/programs");
    } else {
      toast.error(res.error || "Failed to delete program");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/programs")}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Programs
        </Button>
      </div>

      {/* Main Header Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono text-xs bg-muted">
                  {program.code}
                </Badge>
                <Badge variant="outline" className={`text-xs gap-1 font-medium ${statusConfig.badge}`}>
                  <StatusIcon className="h-3.5 w-3.5" /> {statusConfig.label}
                </Badge>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {ASSISTANCE_TYPE_LABELS[program.assistanceType] || program.assistanceType}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">{program.name}</h1>
              <p className="text-xs text-muted-foreground">
                Created on {new Date(program.createdAt).toLocaleDateString()} • Last updated {new Date(program.updatedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEnrollModalOpen(true)}
                className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              >
                <UserPlus className="h-4 w-4" /> Enroll Beneficiary
              </Button>
              <Button
                size="sm"
                onClick={() => setDisburseModalOpen(true)}
                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <HandHeart className="h-4 w-4" /> Disburse Aid
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/dashboard/programs/${program.id}/edit`)}
                className="text-xs gap-1.5"
              >
                <Edit className="h-4 w-4" /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeleteProgram}
                className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Program Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Budget
              </span>
              <span className="text-xl font-bold text-foreground mt-1 block">
                {formatPKR(program.budget)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Total allocated funding
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
                Spent / Disbursed
              </span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {formatPKR(program.spentBudget)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                {usagePercent}% of budget utilized
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
                Enrolled Beneficiaries
              </span>
              <span className="text-xl font-bold text-foreground mt-1 block">
                {program.enrollments.length}
                {program.targetBeneficiaries ? ` / ${program.targetBeneficiaries}` : ""}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Active beneficiaries
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Disbursements Logged
              </span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
                {program.disbursements.length}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Aid transactions issued
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <HandHeart className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabbed Console */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border p-1">
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Overview & Criteria
          </TabsTrigger>
          <TabsTrigger value="beneficiaries" className="text-xs gap-1.5">
            <Users className="h-3.5 w-3.5" /> Enrolled Beneficiaries ({program.enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="disbursements" className="text-xs gap-1.5">
            <HandHeart className="h-3.5 w-3.5" /> Aid Disbursements ({program.disbursements.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & CONFIGURATION */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold">Program Overview & Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-xs">
              <p className="text-foreground leading-relaxed">
                {program.description || "No detailed overview provided for this program configuration."}
              </p>

              {/* Budget Bar */}
              <div className="space-y-2 bg-muted/20 p-4 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Budget Disbursed Progress</span>
                  <span className="font-bold text-primary">{usagePercent}% Utilized</span>
                </div>
                <Progress value={usagePercent} className="h-2.5" />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Spent: <strong>{formatPKR(program.spentBudget)}</strong></span>
                  <span>Remaining: <strong>{formatPKR(Math.max(program.budget - program.spentBudget, 0))}</strong></span>
                  <span>Total Budget: <strong>{formatPKR(program.budget)}</strong></span>
                </div>
              </div>

              {/* Eligibility Criteria */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-purple-600" /> Eligibility Criteria Rules
                </h4>
                <div className="p-4 rounded-xl border border-border bg-card leading-relaxed text-muted-foreground">
                  {program.eligibilityCriteria || "No specific eligibility criteria rules defined."}
                </div>
              </div>

              {/* Required Documents */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-amber-600" /> Required Verification Documents
                </h4>
                {program.requiredDocuments && program.requiredDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {program.requiredDocuments.map((doc) => (
                      <div
                        key={doc}
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{doc.replace(/_/g, " ")}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specific document verification requirements attached.</p>
                )}
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Start Date</span>
                  <span className="font-semibold text-foreground mt-0.5 block flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> {new Date(program.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">End Date</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {program.endDate ? new Date(program.endDate).toLocaleDateString() : "Ongoing Program"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Beneficiary Target Capacity</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {program.targetBeneficiaries ? `${program.targetBeneficiaries} Families` : "No Cap"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ENROLLED BENEFICIARIES */}
        <TabsContent value="beneficiaries" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Enrolled Beneficiaries</CardTitle>
                <CardDescription className="text-xs">
                  Beneficiaries currently registered to receive aid under this welfare program.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setEnrollModalOpen(true)}
                className="text-xs gap-1.5 font-semibold"
              >
                <UserPlus className="h-3.5 w-3.5" /> Enroll Beneficiary
              </Button>
            </CardHeader>
            <CardContent>
              {program.enrollments.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-3">
                  <Users className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                  <p>No beneficiaries enrolled in this program yet.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEnrollModalOpen(true)}
                    className="text-xs gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Enroll First Beneficiary
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border font-semibold">
                      <tr>
                        <th className="p-3 pl-4">Beneficiary Name</th>
                        <th className="p-3">CNIC / ID</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Enrolled Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {program.enrollments.map((e) => (
                        <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 pl-4 font-bold text-foreground">
                            <Link
                              href={`/dashboard/beneficiaries/${e.beneficiary.id}`}
                              className="hover:text-primary transition-colors flex items-center gap-1.5"
                            >
                              {e.beneficiary.name}
                              <ExternalLink className="h-3 w-3 opacity-60" />
                            </Link>
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">
                            {e.beneficiary.cnic || "N/A"}
                          </td>
                          <td className="p-3 text-muted-foreground">{e.beneficiary.phone || "N/A"}</td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(e.enrolledAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              {e.status}
                            </Badge>
                          </td>
                          <td className="p-3 pr-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveEnrollment(e.id, e.beneficiary.name)}
                              className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: AID DISBURSEMENTS */}
        <TabsContent value="disbursements" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Aid Disbursement Log History</CardTitle>
                <CardDescription className="text-xs">
                  Financial grants, dry ration packages, and equipment disbursed under this program.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setDisburseModalOpen(true)}
                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <HandHeart className="h-3.5 w-3.5" /> Disburse Aid
              </Button>
            </CardHeader>
            <CardContent>
              {program.disbursements.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-3">
                  <HandHeart className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                  <p>No aid disbursements recorded yet for this program.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDisburseModalOpen(true)}
                    className="text-xs gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> Record First Disbursement
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border font-semibold">
                      <tr>
                        <th className="p-3 pl-4">Beneficiary</th>
                        <th className="p-3">Amount (PKR)</th>
                        <th className="p-3">Item / Quantity</th>
                        <th className="p-3">Details</th>
                        <th className="p-3">Disbursed Date</th>
                        <th className="p-3 pr-4">Given By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {program.disbursements.map((d) => (
                        <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 pl-4 font-bold text-foreground">
                            <Link
                              href={`/dashboard/beneficiaries/${d.beneficiary.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {d.beneficiary.name}
                            </Link>
                          </td>
                          <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatPKR(d.amount)}
                          </td>
                          <td className="p-3 font-medium text-foreground">{d.quantity || "—"}</td>
                          <td className="p-3 text-muted-foreground max-w-xs truncate">{d.description || "—"}</td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(d.givenAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 pr-4 text-muted-foreground font-medium">{d.givenBy || "Staff Officer"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EnrollBeneficiaryModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        programId={program.id}
        programName={program.name}
      />

      <DisburseAidModal
        isOpen={disburseModalOpen}
        onClose={() => setDisburseModalOpen(false)}
        programId={program.id}
        programName={program.name}
        enrolledBeneficiaries={program.enrollments}
      />
    </div>
  );
}
