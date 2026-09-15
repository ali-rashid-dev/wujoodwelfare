"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Home,
  Users,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  FileText,
  DollarSign,
  ArrowLeft,
  HeartHandshake,
  User,
  Heart,
  Calendar,
  Phone,
  MapPin,
  CheckCircle2,
  FolderOpen,
  HelpCircle,
} from "lucide-react";
import {
  addHouseholdMember,
  deleteHouseholdMember,
  addHouseholdDocument,
  WelfareAssessment,
} from "@/app/(dashboard)/dashboard/households/households";
import { HouseholdMemberInput } from "@/validation/household";

interface HouseholdProfileProps {
  household: {
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
    housingCondition?: string | null;
    vulnerabilityScore: number;
    vulnerabilityCategory: string;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    assessment: WelfareAssessment;
    headBeneficiary?: {
      id: string;
      name: string;
      cnic?: string | null;
      phone?: string | null;
      address?: { city?: string | null; province?: string | null } | null;
    } | null;
    members: Array<{
      id: string;
      fullName: string;
      cnic?: string | null;
      relationToHead: string;
      age?: number | null;
      gender?: string | null;
      employmentStatus?: string | null;
      monthlyIncome: number;
      isDisable: boolean;
      isElderly: boolean;
      isDependent: boolean;
      healthCondition?: string | null;
    }>;
    documents: Array<{
      id: string;
      title: string;
      type: string;
      fileUrl: string;
      uploadedAt: string;
    }>;
  };
}

export function HouseholdProfile({ household }: HouseholdProfileProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Dialog State
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);

  // New Member Form State
  const [fullName, setFullName] = useState("");
  const [cnic, setCnic] = useState("");
  const [relationToHead, setRelationToHead] = useState("SON");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("MALE");
  const [employmentStatus, setEmploymentStatus] = useState("UNEMPLOYED");
  const [memberIncome, setMemberIncome] = useState("0");
  const [isDisable, setIsDisable] = useState(false);
  const [isElderly, setIsElderly] = useState(false);
  const [isDependent, setIsDependent] = useState(true);

  // New Document Form State
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("CNIC");
  const [docUrl, setDocUrl] = useState("");

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    const payload: HouseholdMemberInput = {
      fullName,
      cnic,
      relationToHead: relationToHead as any,
      age: age ? Number(age) : undefined,
      gender: gender as any,
      employmentStatus: employmentStatus as any,
      monthlyIncome: Number(memberIncome) || 0,
      isDisable,
      isElderly,
      isDependent,
    };

    startTransition(async () => {
      const res = await addHouseholdMember(household.id, payload);
      if (res.success) {
        toast.success("Family member added successfully");
        setMemberDialogOpen(false);
        setFullName("");
        setCnic("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to add family member");
      }
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    startTransition(async () => {
      const res = await deleteHouseholdMember(memberId, household.id);
      if (res.success) {
        toast.success("Family member removed");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to remove member");
      }
    });
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docUrl.trim()) {
      toast.error("Document title and URL are required");
      return;
    }

    startTransition(async () => {
      const res = await addHouseholdDocument(household.id, {
        title: docTitle,
        type: docType as any,
        fileUrl: docUrl,
      });
      if (res.success) {
        toast.success("Household document uploaded");
        setDocDialogOpen(false);
        setDocTitle("");
        setDocUrl("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to upload document");
      }
    });
  };

  const getVulnerabilityBadge = (category: string, score: number) => {
    switch (category) {
      case "CRITICAL":
        return (
          <Badge variant="destructive" className="gap-1 bg-rose-600 dark:bg-rose-500 font-bold px-3 py-1 text-xs">
            <ShieldAlert className="w-4 h-4" /> CRITICAL WELFARE NEED ({score}/100)
          </Badge>
        );
      case "HIGH":
        return (
          <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 border border-amber-500/30 font-bold px-3 py-1 text-xs">
            <AlertTriangle className="w-4 h-4" /> HIGH PRIORITY ({score}/100)
          </Badge>
        );
      case "MODERATE":
        return (
          <Badge variant="outline" className="gap-1 border-blue-500/30 text-blue-600 bg-blue-500/10 font-bold px-3 py-1 text-xs">
            <HeartHandshake className="w-4 h-4" /> MODERATE NEED ({score}/100)
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground font-semibold px-3 py-1 text-xs">
            <ShieldCheck className="w-4 h-4" /> STABLE / LOW NEED ({score}/100)
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

  const assessment = household.assessment;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/households"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Households
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Home className="w-6 h-6 text-primary" /> {household.name}
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {household.householdCode}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registered on {new Date(household.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {getVulnerabilityBadge(household.vulnerabilityCategory, household.vulnerabilityScore)}
        </div>
      </div>

      {/* Overview Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Total Family Members</span>
              <span className="text-2xl font-extrabold text-foreground mt-0.5 block">{household.totalMembers}</span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                {household.childrenCount} Children, {household.dependents} Dependents
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Monthly Family Income</span>
              <span className="text-xl font-extrabold text-foreground mt-0.5 block">
                {formatPKR(household.monthlyIncome)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                {formatPKR(assessment.perCapitaIncome)} / person
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Disabled / Medical Care</span>
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5 block">
                {household.disabledCount}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                {household.elderlyCount} Elderly dependents
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Housing Status</span>
              <span className="text-lg font-bold text-foreground mt-0.5 block truncate">
                {household.housingType || "N/A"}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block truncate">
                {household.housingCondition || "Standard Shelter"}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welfare Assessment Scorecard Banner */}
      <Card className="border-primary/30 shadow-xs bg-gradient-to-r from-primary/5 via-card to-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-primary" /> Automated Welfare Assessment
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Calculated based on household per-capita income, dependents ratio, elderly/disabled counts, and shelter vulnerability.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-muted-foreground block font-medium">Vulnerability Index</span>
                <span className="text-3xl font-black text-primary">{assessment.score} / 100</span>
              </div>
            </div>
          </div>

          {/* Vulnerability Reasons & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3.5 rounded-xl border border-border bg-background space-y-2">
              <span className="font-bold text-foreground block flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Vulnerability Drivers
              </span>
              <ul className="space-y-1 text-muted-foreground pl-5 list-disc">
                {assessment.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
              <span className="font-bold text-primary block flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Recommended Welfare Action
              </span>
              <p className="text-foreground leading-relaxed font-medium">
                {assessment.recommendation}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="family" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full bg-card p-1 rounded-xl border border-border">
          <TabsTrigger value="family" className="gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5" /> Family Hierarchy ({household.members.length})
          </TabsTrigger>
          <TabsTrigger value="head" className="gap-1.5 text-xs">
            <UserCheck className="w-3.5 h-3.5" /> Head Beneficiary
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5 text-xs">
            <FolderOpen className="w-3.5 h-3.5" /> Household Docs ({household.documents.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: FAMILY HIERARCHY & MEMBERS */}
        <TabsContent value="family" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Family Breakdown & Dependents</h3>
            <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
              <DialogTrigger
                render={
                  <Button size="sm" className="text-xs gap-1 font-semibold">
                    <Plus className="w-3.5 h-3.5" /> Add Family Member
                  </Button>
                }
              />
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                  <DialogDescription>
                    Add a resident family member (Child, Elderly, Disabled, Spouse) to this household.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddMember} className="space-y-3 text-xs pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Full Name *</Label>
                    <Input
                      placeholder="e.g. Zainab Bibi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Relation to Head</Label>
                      <NativeSelect
                        value={relationToHead}
                        onChange={(e) => setRelationToHead(e.target.value)}
                      >
                        <NativeSelectOption value="SPOUSE">Spouse</NativeSelectOption>
                        <NativeSelectOption value="SON">Son</NativeSelectOption>
                        <NativeSelectOption value="DAUGHTER">Daughter</NativeSelectOption>
                        <NativeSelectOption value="FATHER">Father</NativeSelectOption>
                        <NativeSelectOption value="MOTHER">Mother</NativeSelectOption>
                        <NativeSelectOption value="BROTHER">Brother</NativeSelectOption>
                        <NativeSelectOption value="SISTER">Sister</NativeSelectOption>
                        <NativeSelectOption value="OTHER">Other Relative</NativeSelectOption>
                      </NativeSelect>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Age</Label>
                      <Input
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Gender</Label>
                      <NativeSelect value={gender} onChange={(e) => setGender(e.target.value)}>
                        <NativeSelectOption value="MALE">Male</NativeSelectOption>
                        <NativeSelectOption value="FEMALE">Female</NativeSelectOption>
                        <NativeSelectOption value="OTHER">Other</NativeSelectOption>
                      </NativeSelect>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">CNIC (Optional)</Label>
                      <Input
                        placeholder="CNIC"
                        value={cnic}
                        onChange={(e) => setCnic(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Individual Monthly Income (PKR)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={memberIncome}
                      onChange={(e) => setMemberIncome(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 pt-1 border-t border-border">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDependent}
                        onChange={(e) => setIsDependent(e.target.checked)}
                      />
                      <span>Is Financial Dependent</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDisable}
                        onChange={(e) => setIsDisable(e.target.checked)}
                      />
                      <span className="text-rose-600 font-medium">Physical / Mental Disability</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isElderly}
                        onChange={(e) => setIsElderly(e.target.checked)}
                      />
                      <span className="text-amber-600 font-medium">Elderly Dependent (60+)</span>
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setMemberDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Member</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {household.members.map((member) => (
              <Card key={member.id} className="border-border shadow-xs hover:border-primary/40 transition-colors">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-foreground block">{member.fullName}</span>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {member.relationToHead}
                      </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMember(member.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    {member.cnic && (
                      <span className="block font-mono text-[11px]">CNIC: {member.cnic}</span>
                    )}
                    {member.age && <span className="block">Age: {member.age} years</span>}
                    <span className="block">Income: {formatPKR(member.monthlyIncome)} / mo</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {member.isDependent && (
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        Dependent
                      </Badge>
                    )}
                    {member.isDisable && (
                      <Badge variant="destructive" className="text-[10px] font-semibold">
                        Disabled
                      </Badge>
                    )}
                    {member.isElderly && (
                      <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 font-semibold">
                        Elderly
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 2: HEAD BENEFICIARY */}
        <TabsContent value="head">
          {household.headBeneficiary ? (
            <Card className="border-border shadow-xs">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">{household.headBeneficiary.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        CNIC: {household.headBeneficiary.cnic || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/beneficiaries/${household.headBeneficiary.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs gap-1.5" })}
                  >
                    <User className="w-3.5 h-3.5 text-primary" /> View Full Profile
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-border">
                  <div>
                    <span className="text-muted-foreground block font-medium">Contact Phone</span>
                    <span className="font-semibold text-foreground">{household.headBeneficiary.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Location</span>
                    <span className="font-semibold text-foreground">
                      {household.headBeneficiary.address?.city || "Location not recorded"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-xs text-center py-8">
              <CardContent>
                <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                <h3 className="text-sm font-bold text-foreground">No Head Beneficiary Assigned</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  This household is registered as a standalone family unit. You can link a head beneficiary anytime.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 3: HOUSEHOLD DOCUMENTS */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Household Verification Documents</h3>
            <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
              <DialogTrigger
                render={
                  <Button size="sm" className="text-xs gap-1 font-semibold">
                    <Plus className="w-3.5 h-3.5" /> Attach Document
                  </Button>
                }
              />
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Attach Household Document</DialogTitle>
                  <DialogDescription>
                    Attach Family B-Form, Electricity/Gas Bill, or Residence Proof.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddDoc} className="space-y-3 text-xs pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Document Title *</Label>
                    <Input
                      placeholder="e.g. Utility Bill (Gas) 2026"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Document Type</Label>
                    <NativeSelect value={docType} onChange={(e) => setDocType(e.target.value)}>
                      <NativeSelectOption value="PROOF_OF_RESIDENCE">Proof of Residence / Bill</NativeSelectOption>
                      <NativeSelectOption value="B_FORM">B-Form (Family Children)</NativeSelectOption>
                      <NativeSelectOption value="PROOF_OF_INCOME">Income Certificate</NativeSelectOption>
                      <NativeSelectOption value="CNIC">CNIC Copy</NativeSelectOption>
                      <NativeSelectOption value="OTHER">Other Document</NativeSelectOption>
                    </NativeSelect>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Document URL *</Label>
                    <Input
                      placeholder="https://example.com/docs/file.pdf"
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDocDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Upload Document</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {household.documents.length === 0 ? (
              <Card className="col-span-2 border-border text-center py-8">
                <CardContent>
                  <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-foreground">No household documents uploaded</p>
                </CardContent>
              </Card>
            ) : (
              household.documents.map((doc) => (
                <Card key={doc.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs text-foreground block">{doc.title}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {doc.type}
                      </Badge>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs gap-1" })}
                    >
                      <FileText className="w-3.5 h-3.5 text-primary" /> Open Document
                    </a>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
