"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  ArrowLeft,
  UserCheck,
  FileCheck,
  Home,
  DollarSign,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Award,
  Loader2,
  Briefcase,
  FileText,
  User,
  Activity,
  Save,
  AlertOctagon,
  ShieldAlert,
} from "lucide-react";
import {
  updateIdentityCheck,
  updateDocumentCheck,
  updateHouseholdCheck,
  updateIncomeAssessment,
  updateFieldVerification,
  submitEligibilityChecklist,
  decideVerification,
} from "@/app/(dashboard)/dashboard/verification/verification-actions";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  notes?: string;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "c1", label: "Valid Pakistani CNIC or NADRA B-Form", passed: true, weight: 20 },
  { id: "c2", label: "Verified Monthly Household Income below PKR 45,000 threshold", passed: true, weight: 25 },
  { id: "c3", label: "No active duplicate welfare application or double-dipping detected", passed: true, weight: 20 },
  { id: "c4", label: "Physical home address & area residency verified by field officer", passed: true, weight: 15 },
  { id: "c5", label: "Applicant is not a government employee or receiving regular pension", passed: true, weight: 10 },
  { id: "c6", label: "Vulnerable household category (Orphan, Widow, Disabled, Elderly)", passed: true, weight: 10 },
];

interface VerificationProfileProps {
  record: {
    id: string;
    verificationCode: string;
    verifierName: string;
    status: string;
    overallScore: number;

    identityStatus: string;
    cnicVerified: boolean;
    bformVerified: boolean;
    biometricStatus: string | null;
    nadraRefNo: string | null;
    identityNotes: string | null;

    documentStatus: string;
    docAuthenticityChecked: boolean;
    missingDocuments: string[];
    documentNotes: string | null;

    householdStatus: string;
    verifiedFamilySize: number | null;
    verifiedDependents: number | null;
    verifiedHousingCondition: string | null;
    assetAuditSummary: string | null;
    householdNotes: string | null;

    incomeStatus: string;
    declaredIncome: number | null;
    verifiedIncome: number | null;
    incomeThreshold: number | null;
    isEligibleIncome: boolean;
    povertyScoreIndex: number;
    incomeNotes: string | null;

    checklistData: unknown;

    fieldStatus: string;
    fieldOfficerId: string | null;
    fieldOfficerName: string | null;
    fieldVisitDate: string | null;
    neighborCheckPassed: boolean | null;
    physicalAddressVerified: boolean;
    fieldNotes: string | null;

    decisionReason: string | null;
    decidedAt: string | null;
    decidedBy: string | null;
    createdAt: string;

    beneficiary: {
      id: string;
      name: string;
      cnic: string | null;
      phone: string | null;
      status: string;
      registeredAt: string;
      address: { street: string | null; area: string | null; city: string | null; district: string | null; province: string | null } | null;
      family: { totalChildren: number; dependents: number } | null;
      economic: { monthlyIncome: number | null; employmentStatus: string | null; housingType: string | null } | null;
      documents: Array<{ id: string; type: string; label: string | null; fileUrl: string; uploadedAt: Date }>;
    } | null;

    caseItem: {
      id: string;
      caseNumber: string | null;
      title: string;
      status: string;
    } | null;

    application: {
      id: string;
      applicationCode: string;
      assistanceType: string;
      status: string;
    } | null;

    logs: Array<{
      id: string;
      action: string;
      fromStatus: string | null;
      toStatus: string | null;
      performedBy: string;
      notes: string | null;
      timestamp: string;
    }>;

    duplicateInfo: {
      isDuplicate: boolean;
      summary: string;
      beneficiaries: Array<{ id: string; name: string; cnic: string | null; status: string }>;
      activeCases: Array<{ id: string; caseNumber: string | null; title: string; status: string }>;
      applications: Array<{ id: string; applicationCode: string; status: string }>;
    } | null;
  };
}

export function VerificationProfile({ record }: VerificationProfileProps) {
  const router = useRouter();
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Identity state
  const [identityStatus, setIdentityStatus] = useState(record.identityStatus);
  const [cnicVerified, setCnicVerified] = useState(record.cnicVerified);
  const [bformVerified, setBformVerified] = useState(record.bformVerified);
  const [biometricStatus, setBiometricStatus] = useState(record.biometricStatus || "VERIFIED");
  const [nadraRefNo, setNadraRefNo] = useState(record.nadraRefNo || "");
  const [identityNotes, setIdentityNotes] = useState(record.identityNotes || "");

  // Document state
  const [documentStatus, setDocumentStatus] = useState(record.documentStatus);
  const [docAuthenticityChecked, setDocAuthenticityChecked] = useState(record.docAuthenticityChecked);
  const [missingDocuments] = useState<string[]>(record.missingDocuments || []);
  const [documentNotes, setDocumentNotes] = useState(record.documentNotes || "");

  // Household state
  const [householdStatus, setHouseholdStatus] = useState(record.householdStatus);
  const [verifiedFamilySize, setVerifiedFamilySize] = useState<number>(record.verifiedFamilySize || record.beneficiary?.family?.totalChildren || 1);
  const [verifiedDependents, setVerifiedDependents] = useState<number>(record.verifiedDependents || record.beneficiary?.family?.dependents || 0);
  const [verifiedHousingCondition, setVerifiedHousingCondition] = useState(record.verifiedHousingCondition || record.beneficiary?.economic?.housingType || "RENTED");
  const [assetAuditSummary, setAssetAuditSummary] = useState(record.assetAuditSummary || "");
  const [householdNotes, setHouseholdNotes] = useState(record.householdNotes || "");

  // Income state
  const [incomeStatus, setIncomeStatus] = useState(record.incomeStatus);
  const [declaredIncome, setDeclaredIncome] = useState<number>(record.declaredIncome || record.beneficiary?.economic?.monthlyIncome || 0);
  const [verifiedIncome, setVerifiedIncome] = useState<number>(record.verifiedIncome || record.declaredIncome || 0);
  const [incomeThreshold, setIncomeThreshold] = useState<number>(record.incomeThreshold || 45000);
  const [povertyScoreIndex, setPovertyScoreIndex] = useState<number>(record.povertyScoreIndex || 35);
  const [incomeNotes, setIncomeNotes] = useState(record.incomeNotes || "");

  // Field state
  const [fieldStatus, setFieldStatus] = useState(record.fieldStatus);
  const [fieldOfficerName, setFieldOfficerName] = useState(record.fieldOfficerName || "Field Inspector");
  const [fieldVisitDate, setFieldVisitDate] = useState(record.fieldVisitDate ? record.fieldVisitDate.split("T")[0] : new Date().toISOString().split("T")[0]);
  const [neighborCheckPassed, setNeighborCheckPassed] = useState(record.neighborCheckPassed ?? true);
  const [physicalAddressVerified, setPhysicalAddressVerified] = useState(record.physicalAddressVerified);
  const [fieldNotes, setFieldNotes] = useState(record.fieldNotes || "");

  // Checklist state
  const initialItems: ChecklistItem[] = Array.isArray(record.checklistData) && record.checklistData.length > 0
    ? (record.checklistData as ChecklistItem[])
    : DEFAULT_CHECKLIST;
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialItems);

  // Decision Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionTarget, setDecisionTarget] = useState<"VERIFIED" | "REJECTED" | "FLAGGED_FRAUD" | "NEEDS_MORE_INFO">("VERIFIED");
  const [decisionReason, setDecisionReason] = useState("");
  const [overallScore, setOverallScore] = useState(record.overallScore || 75);

  const calculateChecklistScore = (items: ChecklistItem[]) => {
    const totalPossibleWeight = items.reduce((acc, curr) => acc + curr.weight, 0);
    const earnedWeight = items.filter((item) => item.passed).reduce((acc, curr) => acc + curr.weight, 0);
    return Math.round((earnedWeight / (totalPossibleWeight || 1)) * 100);
  };

  const handleToggleChecklist = (id: string) => {
    const updated = checklist.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item));
    setChecklist(updated);
    const newScore = calculateChecklistScore(updated);
    setOverallScore(newScore);
  };

  // Section Save Handlers
  const saveIdentity = async () => {
    setSavingSection("IDENTITY");
    try {
      const res = await updateIdentityCheck(record.id, {
        identityStatus: identityStatus as "PASSED" | "FAILED" | "WARNING" | "PENDING",
        cnicVerified,
        bformVerified,
        biometricStatus,
        nadraRefNo,
        identityNotes,
      });
      if (res.success) toast.success("Identity verification saved!");
      else toast.error(res.error);
    } catch {
      toast.error("Failed to save identity check");
    } finally {
      setSavingSection(null);
    }
  };

  const saveDocument = async () => {
    setSavingSection("DOCUMENT");
    try {
      const res = await updateDocumentCheck(record.id, {
        documentStatus: documentStatus as "PASSED" | "FAILED" | "WARNING" | "PENDING",
        docAuthenticityChecked,
        missingDocuments,
        documentNotes,
      });
      if (res.success) toast.success("Document verification saved!");
      else toast.error(res.error);
    } catch {
      toast.error("Failed to save document check");
    } finally {
      setSavingSection(null);
    }
  };

  const saveHousehold = async () => {
    setSavingSection("HOUSEHOLD");
    try {
      const res = await updateHouseholdCheck(record.id, {
        householdStatus: householdStatus as "PASSED" | "FAILED" | "WARNING" | "PENDING",
        verifiedFamilySize,
        verifiedDependents,
        verifiedHousingCondition,
        assetAuditSummary,
        householdNotes,
      });
      if (res.success) toast.success("Household inspection saved!");
      else toast.error(res.error);
    } catch {
      toast.error("Failed to save household check");
    } finally {
      setSavingSection(null);
    }
  };

  const saveIncome = async () => {
    setSavingSection("INCOME");
    try {
      const res = await updateIncomeAssessment(record.id, {
        incomeStatus: incomeStatus as "PASSED" | "FAILED" | "WARNING" | "PENDING",
        declaredIncome,
        verifiedIncome,
        incomeThreshold,
        povertyScoreIndex,
        incomeNotes,
      });
      if (res.success) toast.success("Income & poverty score saved!");
      else toast.error(res.error);
    } catch {
      toast.error("Failed to save income assessment");
    } finally {
      setSavingSection(null);
    }
  };

  const saveField = async () => {
    setSavingSection("FIELD");
    try {
      const res = await updateFieldVerification(record.id, {
        fieldStatus: fieldStatus as "PASSED" | "FAILED" | "WARNING" | "PENDING",
        fieldOfficerName,
        fieldVisitDate,
        neighborCheckPassed,
        physicalAddressVerified,
        fieldNotes,
      });
      if (res.success) toast.success("Field inspection report saved!");
      else toast.error(res.error);
    } catch {
      toast.error("Failed to save field inspection");
    } finally {
      setSavingSection(null);
    }
  };

  const saveChecklist = async () => {
    setSavingSection("CHECKLIST");
    try {
      const computedScore = calculateChecklistScore(checklist);
      const res = await submitEligibilityChecklist(record.id, {
        checklistData: checklist,
        overallScore: computedScore,
      });
      if (res.success) {
        toast.success(`Eligibility checklist saved with overall score of ${computedScore}/100!`);
        setOverallScore(computedScore);
      } else toast.error(res.error);
    } catch {
      toast.error("Failed to save checklist");
    } finally {
      setSavingSection(null);
    }
  };

  const handleExecuteDecision = async () => {
    if (!decisionReason || decisionReason.trim().length < 5) {
      toast.error("Please enter a detailed decision reason (at least 5 characters)");
      return;
    }

    setSavingSection("DECISION");
    try {
      const res = await decideVerification(record.id, {
        targetStatus: decisionTarget,
        overallScore,
        decisionReason,
      });

      if (res.success) {
        toast.success(`Verification decision rendered: ${decisionTarget}`);
        setDecisionModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to submit decision");
      }
    } catch {
      toast.error("Error executing decision");
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background p-4 rounded-xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/verification")} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground font-bold">{record.verificationCode}</span>
              <Badge variant="outline" className={`font-semibold text-xs ${
                record.status === "VERIFIED" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                record.status === "FLAGGED_FRAUD" ? "bg-red-100 text-red-800 border-red-300 animate-pulse font-bold" :
                record.status === "REJECTED" ? "bg-slate-100 text-slate-800 border-slate-300" :
                "bg-amber-100 text-amber-800 border-amber-300"
              }`}>
                {record.status}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-foreground mt-0.5">
              Verification Workbench — {record.beneficiary?.name || "Direct Audit"}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setDecisionTarget("NEEDS_MORE_INFO"); setDecisionModalOpen(true); }}
            className="text-xs gap-1"
          >
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            Request Info
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { setDecisionTarget("FLAGGED_FRAUD"); setDecisionModalOpen(true); }}
            className="text-xs gap-1 border-red-200 text-red-700 hover:bg-red-50"
          >
            <AlertOctagon className="h-3.5 w-3.5 text-red-600" />
            Flag Fraud
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { setDecisionTarget("REJECTED"); setDecisionModalOpen(true); }}
            className="text-xs gap-1 text-slate-700"
          >
            <XCircle className="h-3.5 w-3.5 text-slate-600" />
            Reject Claim
          </Button>

          <Button
            size="sm"
            onClick={() => { setDecisionTarget("VERIFIED"); setDecisionModalOpen(true); }}
            className="text-xs gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve & Verify
          </Button>
        </div>
      </div>

      {/* Fraud Alert Banner if Duplicate Detected */}
      {record.duplicateInfo?.isDuplicate && (
        <Card className="border-red-300 bg-red-50/60 shadow-xs">
          <CardContent className="p-4 flex items-start gap-3">
            <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-red-900">Fraud Prevention Warning: Potential Duplicate Detected</h4>
              <p className="text-xs text-red-700">{record.duplicateInfo.summary}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="font-semibold text-red-800">Matching Records:</span>
                {record.duplicateInfo.beneficiaries.map((b) => (
                  <Badge key={b.id} variant="outline" className="bg-white text-red-800 border-red-200">
                    Beneficiary: {b.name} ({b.status})
                  </Badge>
                ))}
                {record.duplicateInfo.activeCases.map((c) => (
                  <Badge key={c.id} variant="outline" className="bg-white text-red-800 border-red-200">
                    Case: {c.caseNumber || c.title} ({c.status})
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metric Highlights Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Overall Eligibility Score</span>
            <div className="text-xl font-bold text-foreground mt-0.5">{overallScore}/100</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">CNIC Identity Status</span>
            <div className="text-sm font-bold text-foreground mt-0.5">{cnicVerified ? "Verified Match" : "Unverified"}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Income Threshold Check</span>
            <div className="text-sm font-bold text-foreground mt-0.5">
              PKR {verifiedIncome.toLocaleString()} / {incomeThreshold.toLocaleString()}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Field Address Visit</span>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {physicalAddressVerified ? "Address Confirmed" : "Pending Field Check"}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs Workbench */}
      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full h-auto p-1 bg-muted/60">
          <TabsTrigger value="identity" className="text-xs py-2 gap-1.5">
            <UserCheck className="h-3.5 w-3.5" />
            Identity
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs py-2 gap-1.5">
            <FileCheck className="h-3.5 w-3.5" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="household" className="text-xs py-2 gap-1.5">
            <Home className="h-3.5 w-3.5" />
            Household
          </TabsTrigger>
          <TabsTrigger value="income" className="text-xs py-2 gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            Income & PMT
          </TabsTrigger>
          <TabsTrigger value="field" className="text-xs py-2 gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Field Report
          </TabsTrigger>
          <TabsTrigger value="checklist" className="text-xs py-2 gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Checklist & Audit
          </TabsTrigger>
        </TabsList>

        {/* 1. IDENTITY VERIFICATION TAB */}
        <TabsContent value="identity" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Identity & NADRA Verification
                </CardTitle>
                <CardDescription className="text-xs">
                  Verify National Identity Card (CNIC), B-Form, and NADRA reference status.
                </CardDescription>
              </div>
              <Button onClick={saveIdentity} disabled={savingSection === "IDENTITY"} size="sm" className="text-xs gap-1.5">
                {savingSection === "IDENTITY" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Identity Check
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold">Beneficiary Name</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{record.beneficiary?.name || "N/A"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-semibold">CNIC Number</span>
                  <p className="text-sm font-mono font-bold text-foreground mt-0.5">{record.beneficiary?.cnic || "No CNIC"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Identity Audit Outcome</Label>
                  <Select value={identityStatus} onValueChange={(val) => val && setIdentityStatus(val)}>

                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSED">Passed — Authenticated</SelectItem>
                      <SelectItem value="FAILED">Failed — Invalid Identity</SelectItem>
                      <SelectItem value="WARNING">Warning — Needs Review</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Biometric Status</Label>
                  <Select value={biometricStatus} onValueChange={(val) => val && setBiometricStatus(val)}>

                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VERIFIED">Biometric Matched</SelectItem>
                      <SelectItem value="UNVERIFIED">Not Conducted</SelectItem>
                      <SelectItem value="FAILED">Biometric Mismatch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">NADRA Verification Reference #</Label>
                  <Input
                    value={nadraRefNo}
                    onChange={(e) => setNadraRefNo(e.target.value)}
                    placeholder="e.g. NADRA-2026-99218"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background">
                  <div>
                    <span className="text-xs font-semibold text-foreground">CNIC Document Verified</span>
                    <p className="text-[11px] text-muted-foreground">Original or valid copy matched</p>
                  </div>
                  <Switch checked={cnicVerified} onCheckedChange={setCnicVerified} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background">
                  <div>
                    <span className="text-xs font-semibold text-foreground">Family B-Form Verified</span>
                    <p className="text-[11px] text-muted-foreground">Children records matched</p>
                  </div>
                  <Switch checked={bformVerified} onCheckedChange={setBformVerified} />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-semibold">Identity Verification Notes</Label>
                <Textarea
                  value={identityNotes}
                  onChange={(e) => setIdentityNotes(e.target.value)}
                  placeholder="Notes regarding NADRA match, CNIC issue date, or biometric notes..."
                  className="text-xs min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. DOCUMENT VERIFICATION TAB */}
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Document Authenticity & Integrity
                </CardTitle>
                <CardDescription className="text-xs">
                  Review uploaded beneficiary documents and check authenticity.
                </CardDescription>
              </div>
              <Button onClick={saveDocument} disabled={savingSection === "DOCUMENT"} size="sm" className="text-xs gap-1.5">
                {savingSection === "DOCUMENT" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Document Check
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-lg border border-border bg-muted/20">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-foreground">Document Status</span>
                  <div className="flex items-center gap-2">
                    <Select value={documentStatus} onValueChange={(val) => val && setDocumentStatus(val)}>

                      <SelectTrigger className="text-xs w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PASSED">Passed — All Verified</SelectItem>
                        <SelectItem value="FAILED">Failed — Fake/Expired</SelectItem>
                        <SelectItem value="WARNING">Missing Docs</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold">Authenticity Validated:</span>
                  <Switch checked={docAuthenticityChecked} onCheckedChange={setDocAuthenticityChecked} />
                </div>
              </div>

              {/* List of uploaded documents */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground">Uploaded Beneficiary Files ({record.beneficiary?.documents.length || 0})</span>
                {record.beneficiary?.documents.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic p-3 border rounded-lg">No uploaded document files found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {record.beneficiary?.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background text-xs">
                        <div>
                          <div className="font-semibold text-foreground">{doc.type}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{doc.label || doc.fileUrl}</div>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">
                          Uploaded
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-semibold">Document Audit Notes & Discrepancies</Label>
                <Textarea
                  value={documentNotes}
                  onChange={(e) => setDocumentNotes(e.target.value)}
                  placeholder="Document authenticity verification notes, expiry dates, or missing document alerts..."
                  className="text-xs min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. HOUSEHOLD VERIFICATION TAB */}
        <TabsContent value="household" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Household Size & Asset Audit
                </CardTitle>
                <CardDescription className="text-xs">
                  Verify family count, dependents, housing type, and living condition audit.
                </CardDescription>
              </div>
              <Button onClick={saveHousehold} disabled={savingSection === "HOUSEHOLD"} size="sm" className="text-xs gap-1.5">
                {savingSection === "HOUSEHOLD" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Household Check
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Household Audit Status</Label>
                  <Select value={householdStatus} onValueChange={(val) => val && setHouseholdStatus(val)}>

                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSED">Passed — Verified</SelectItem>
                      <SelectItem value="FAILED">Failed — Inaccurate Data</SelectItem>
                      <SelectItem value="WARNING">Needs Field Visit</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Verified Family Members Count</Label>
                  <Input
                    type="number"
                    value={verifiedFamilySize}
                    onChange={(e) => setVerifiedFamilySize(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Verified Dependents Count</Label>
                  <Input
                    type="number"
                    value={verifiedDependents}
                    onChange={(e) => setVerifiedDependents(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Verified Housing Condition / Ownership</Label>
                <Select value={verifiedHousingCondition} onValueChange={(val) => val && setVerifiedHousingCondition(val)}>

                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RENTED">Rented Housing</SelectItem>
                    <SelectItem value="OWNED">Owned House</SelectItem>
                    <SelectItem value="SHARED">Shared Family Accommodation</SelectItem>
                    <SelectItem value="HOMELESS">Homeless / Temporary Shelter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Asset Audit Summary (Land, Vehicle, Livestock, Appliances)</Label>
                <Input
                  value={assetAuditSummary}
                  onChange={(e) => setAssetAuditSummary(e.target.value)}
                  placeholder="e.g. Owns no land or motor vehicle; basic 1-room rented accommodation"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Household Audit Notes</Label>
                <Textarea
                  value={householdNotes}
                  onChange={(e) => setHouseholdNotes(e.target.value)}
                  placeholder="Living conditions, orphan or disabled dependents notes..."
                  className="text-xs min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. INCOME ASSESSMENT TAB */}
        <TabsContent value="income" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Income Assessment & PMT Poverty Score
                </CardTitle>
                <CardDescription className="text-xs">
                  Compare declared vs verified monthly income and calculate Proxy Means Test (PMT) score.
                </CardDescription>
              </div>
              <Button onClick={saveIncome} disabled={savingSection === "INCOME"} size="sm" className="text-xs gap-1.5">
                {savingSection === "INCOME" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Income Assessment
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Income Status</Label>
                  <Select value={incomeStatus} onValueChange={(val) => val && setIncomeStatus(val)}>

                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSED">Passed — Income Eligible</SelectItem>
                      <SelectItem value="FAILED">Failed — Income Over Limit</SelectItem>
                      <SelectItem value="WARNING">Needs Wage Audit</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Declared Monthly Income (PKR)</Label>
                  <Input
                    type="number"
                    value={declaredIncome}
                    onChange={(e) => setDeclaredIncome(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Verified Monthly Income (PKR)</Label>
                  <Input
                    type="number"
                    value={verifiedIncome}
                    onChange={(e) => setVerifiedIncome(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Welfare Cutoff Threshold (PKR)</Label>
                  <Input
                    type="number"
                    value={incomeThreshold}
                    onChange={(e) => setIncomeThreshold(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Poverty Index / PMT Score (0 = Wealthiest, 100 = Poorest)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={povertyScoreIndex}
                    onChange={(e) => setPovertyScoreIndex(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Threshold Comparison Banner */}
              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                verifiedIncome <= incomeThreshold ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
              }`}>
                <div className="font-semibold">
                  {verifiedIncome <= incomeThreshold
                    ? "✓ Verified income is within welfare qualification limit."
                    : "⚠️ Verified income exceeds the PKR 45,000 ceiling threshold!"}
                </div>
                <Badge variant="outline" className={verifiedIncome <= incomeThreshold ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                  {verifiedIncome <= incomeThreshold ? "ELIGIBLE" : "INELIGIBLE"}
                </Badge>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-semibold">Income Verification & Financial Audit Notes</Label>
                <Textarea
                  value={incomeNotes}
                  onChange={(e) => setIncomeNotes(e.target.value)}
                  placeholder="Daily wage details, utility bill cross-checks, or employer references..."
                  className="text-xs min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. FIELD VERIFICATION TAB */}
        <TabsContent value="field" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Field Inspection & Physical Location Visit
                </CardTitle>
                <CardDescription className="text-xs">
                  Record field officer visit findings, neighbor checks, and physical address confirmation.
                </CardDescription>
              </div>
              <Button onClick={saveField} disabled={savingSection === "FIELD"} size="sm" className="text-xs gap-1.5">
                {savingSection === "FIELD" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Field Report
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Field Report Status</Label>
                  <Select value={fieldStatus} onValueChange={(val) => val && setFieldStatus(val)}>

                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSED">Passed — Address Confirmed</SelectItem>
                      <SelectItem value="FAILED">Failed — Fake Address</SelectItem>
                      <SelectItem value="WARNING">Inconclusive Visit</SelectItem>
                      <SelectItem value="PENDING">Pending Visit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Field Inspector Name</Label>
                  <Input
                    value={fieldOfficerName}
                    onChange={(e) => setFieldOfficerName(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Field Visit Date</Label>
                  <Input
                    type="date"
                    value={fieldVisitDate}
                    onChange={(e) => setFieldVisitDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background">
                  <div>
                    <span className="text-xs font-semibold text-foreground">Physical Address Verified</span>
                    <p className="text-[11px] text-muted-foreground">Inspector visited actual residence</p>
                  </div>
                  <Switch checked={physicalAddressVerified} onCheckedChange={setPhysicalAddressVerified} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background">
                  <div>
                    <span className="text-xs font-semibold text-foreground">Neighbor Reference Check</span>
                    <p className="text-[11px] text-muted-foreground">Neighbors confirmed financial standing</p>
                  </div>
                  <Switch checked={neighborCheckPassed} onCheckedChange={setNeighborCheckPassed} />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-semibold">Field Visit Findings & Inspection Notes</Label>
                <Textarea
                  value={fieldNotes}
                  onChange={(e) => setFieldNotes(e.target.value)}
                  placeholder="Physical inspection findings, house conditions, neighbor quotes..."
                  className="text-xs min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. CHECKLIST & AUDIT TAB */}
        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Multi-Criteria Eligibility Checklist Engine
                </CardTitle>
                <CardDescription className="text-xs">
                  Toggle pass/fail rules to compute overall score and verify fraud prevention metrics.
                </CardDescription>
              </div>
              <Button onClick={saveChecklist} disabled={savingSection === "CHECKLIST"} size="sm" className="text-xs gap-1.5">
                {savingSection === "CHECKLIST" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Checklist
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                      item.passed ? "bg-emerald-50/40 border-emerald-200" : "bg-red-50/40 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-xs text-foreground">{item.label}</div>
                        <div className="text-[11px] text-muted-foreground">Rule Weight: {item.weight} pts</div>
                      </div>
                    </div>
                    <Switch checked={item.passed} onCheckedChange={() => handleToggleChecklist(item.id)} />
                  </div>
                ))}
              </div>

              {/* Score Summary */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold">Calculated Rule Score</span>
                  <div className="text-2xl font-bold text-foreground mt-0.5">{overallScore} / 100</div>
                </div>
                <Badge variant="outline" className={`text-xs px-3 py-1 font-bold ${
                  overallScore >= 70 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {overallScore >= 70 ? "RECOMMENDED FOR APPROVAL" : "HIGH RISK / MANUAL REVIEW"}
                </Badge>
              </div>

              {/* Verification History Log */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-bold text-xs text-foreground mb-3 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-primary" />
                  Verification Audit History Trail ({record.logs.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {record.logs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg border border-border/50 bg-background text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{log.action}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        By <span className="font-medium">{log.performedBy}</span> {log.notes ? `— ${log.notes}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Decision Dialog Modal */}
      <Dialog open={decisionModalOpen} onOpenChange={setDecisionModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
              <ShieldCheck className="h-5 w-5" />
              <span>Final Judgment Render</span>
            </div>
            <DialogTitle className="text-xl font-bold">
              Execute Verification Decision — {decisionTarget}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Confirm final verification status. This action automatically updates connected Beneficiary, Case, or Application statuses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Decision Verdict</Label>
              <Select value={decisionTarget} onValueChange={(v) => v && setDecisionTarget(v as typeof decisionTarget)}>

                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VERIFIED">VERIFIED — Qualified for Assistance</SelectItem>
                  <SelectItem value="REJECTED">REJECTED — Ineligible Claim</SelectItem>
                  <SelectItem value="FLAGGED_FRAUD">FLAGGED FRAUD — Suspected Duplicate / Fraud</SelectItem>
                  <SelectItem value="NEEDS_MORE_INFO">NEEDS MORE INFO — Request Field Investigation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Final Score (0-100)</Label>
              <Input
                type="number"
                value={overallScore}
                onChange={(e) => setOverallScore(Number(e.target.value))}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Decision Reason & Audit Notes (Mandatory)</Label>
              <Textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Provide clear justification for approving, rejecting, or flagging fraud..."
                className="text-xs min-h-[90px]"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDecisionModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleExecuteDecision}
              disabled={savingSection === "DECISION"}
              className={`text-xs font-semibold gap-1.5 ${
                decisionTarget === "VERIFIED" ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                decisionTarget === "FLAGGED_FRAUD" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-slate-900 text-white"
              }`}
            >
              {savingSection === "DECISION" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Render Verdict
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
