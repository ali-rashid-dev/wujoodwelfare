"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Phone,
  MapPin,
  Users,
  BadgeDollarSign,
  FileText,
  History,
  FolderOpen,
  Edit,
  Plus,
  ArrowLeft,
  ShieldCheck,
  DollarSign,
  Upload,
  Loader2,
  Copy,
  Check,
  MessageSquare,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { AssistanceTimeline, AssistanceItem } from "./AssistanceTimeline";
import { DocumentCard } from "./DocumentCard";
import {
  addAssistanceRecord,
  addBeneficiaryDocument,
  addBeneficiaryCase,
  updateBeneficiaryStatus,
} from "@/app/(dashboard)/dashboard/beneficiaries/beneficiaries";
import { BeneficiaryStatus } from "@prisma/client";

interface BeneficiaryProfileProps {
  beneficiary: {
    id: string;
    name: string;
    cnic?: string | null;
    fatherName?: string | null;
    dateOfBirth?: string | Date | null;
    gender?: string | null;
    status: string;
    verifiedAt?: string | Date | null;
    notes?: string | null;
    registeredAt: string | Date;
    contact?: {
      phone?: string | null;
      phone2?: string | null;
      whatsapp?: string | null;
      email?: string | null;
    } | null;
    address?: {
      street?: string | null;
      city?: string | null;
      district?: string | null;
      province?: string | null;
      postalCode?: string | null;
    } | null;
    family?: {
      maritalStatus?: string | null;
      spouseName?: string | null;
      dependents?: number | null;
      disabledMembers?: number | null;
    } | null;
    economic?: {
      employmentStatus?: string | null;
      occupation?: string | null;
      monthlyIncome?: number | null;
      housingType?: string | null;
    } | null;
    documents: Array<{
      id: string;
      label?: string | null;
      type: string;
      fileUrl: string;
      uploadedAt: string | Date;
    }>;
    cases: Array<{
      id: string;
      title: string;
      description?: string | null;
      isOpen: boolean;
      openedAt: string | Date;
    }>;
    assistanceHistory: AssistanceItem[];
  };
}

export function BeneficiaryProfile({ beneficiary }: BeneficiaryProfileProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isVerified = Boolean(beneficiary.verifiedAt);
  const [copiedCnic, setCopiedCnic] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Modals state
  const [aidDialogOpen, setAidDialogOpen] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [caseDialogOpen, setCaseDialogOpen] = useState(false);

  // Record Aid Form
  const [aidType, setAidType] = useState("FINANCIAL");
  const [aidAmount, setAidAmount] = useState("");
  const [aidDescription, setAidDescription] = useState("");
  const [aidDate, setAidDate] = useState(new Date().toISOString().split("T")[0]);
  const [aidBy, setAidBy] = useState("");

  // Add Document Form
  const [docLabel, setDocLabel] = useState("");
  const [docType, setDocType] = useState("CNIC");
  const [docUrl, setDocUrl] = useState("");

  // Add Case Form
  const [caseTitle, setCaseTitle] = useState("");
  const [caseDesc, setCaseDesc] = useState("");

  const copyToClipboard = async (text: string, type: "cnic" | "phone") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "cnic") {
        setCopiedCnic(true);
        toast.success("CNIC copied to clipboard");
        setTimeout(() => setCopiedCnic(false), 2000);
      } else {
        setCopiedPhone(true);
        toast.success("Phone number copied to clipboard");
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleAddAid = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await addAssistanceRecord(beneficiary.id, {
        type: aidType as any,
        amount: aidAmount ? Number(aidAmount) : undefined,
        description: aidDescription,
        givenAt: aidDate,
        givenBy: aidBy,
      });

      if (res.success) {
        toast.success("Assistance record logged successfully!");
        setAidDialogOpen(false);
        setAidDescription("");
        setAidAmount("");
        setAidBy("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to add assistance record");
      }
    });
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await addBeneficiaryDocument(beneficiary.id, {
        label: docLabel,
        type: docType as any,
        fileUrl: docUrl,
      });

      if (res.success) {
        toast.success("Verification document attached!");
        setDocDialogOpen(false);
        setDocLabel("");
        setDocUrl("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to add document");
      }
    });
  };

  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await addBeneficiaryCase(beneficiary.id, {
        title: caseTitle,
        description: caseDesc,
        isOpen: true,
      });

      if (res.success) {
        toast.success("Special case opened successfully!");
        setCaseDialogOpen(false);
        setCaseTitle("");
        setCaseDesc("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create case");
      }
    });
  };

  const handleToggleVerified = async () => {
    startTransition(async () => {
      const res = await updateBeneficiaryStatus(
        beneficiary.id,
        beneficiary.status as BeneficiaryStatus,
        !isVerified
      );
      if (res.success) {
        toast.success(isVerified ? "Verification status revoked" : "Beneficiary verified successfully");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update verification status");
      }
    });
  };

  const totalAidAmount = beneficiary.assistanceHistory.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  const formatPKR = (val: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/beneficiaries")}
          className="gap-1.5 text-xs h-9 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Beneficiaries List
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleVerified}
            disabled={isPending}
            className={`gap-1.5 text-xs h-9 font-medium ${
              isVerified
                ? "border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                : "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {isVerified ? "Revoke Verification" : "Verify Beneficiary"}
          </Button>

          {/* Record Aid Dialog */}
          <Dialog open={aidDialogOpen} onOpenChange={setAidDialogOpen}>
            <DialogTrigger render={<Button size="sm" className="gap-1.5 text-xs h-9 font-semibold"><DollarSign className="w-4 h-4" /> Record Aid</Button>} />
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleAddAid}>
                <DialogHeader>
                  <DialogTitle>Record Aid Distribution</DialogTitle>
                  <DialogDescription>
                    Log financial aid, food rations, or medical support given to {beneficiary.name}.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Assistance Type</Label>
                    <Select value={aidType} onValueChange={(val) => val && setAidType(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FINANCIAL">Financial Assistance</SelectItem>
                        <SelectItem value="FOOD">Food Assistance</SelectItem>
                        <SelectItem value="MEDICAL">Medical Treatment / Medicine</SelectItem>
                        <SelectItem value="EDUCATION">Educational Fee / School Kit</SelectItem>
                        <SelectItem value="HOUSING">Shelter / Housing Repair</SelectItem>
                        <SelectItem value="FINANCIAL">Emergency Financial Relief</SelectItem>
                        <SelectItem value="OTHER">Job / Small Business Support</SelectItem>
                        <SelectItem value="OTHER">Other Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Description / Details *</Label>
                    <Input
                      required
                      placeholder="e.g. Monthly Ration Pack Box #4 or Ramzan Cash Support"
                      value={aidDescription}
                      onChange={(e) => setAidDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Amount (PKR)</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 15000"
                        value={aidAmount}
                        onChange={(e) => setAidAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Date Provided *</Label>
                      <Input
                        type="date"
                        required
                        value={aidDate}
                        onChange={(e) => setAidDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Authorized / Given By</Label>
                    <Input
                      placeholder="e.g. Welfare Officer Ali"
                      value={aidBy}
                      onChange={(e) => setAidBy(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAidDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save Record
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Attach Document Dialog */}
          <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5 text-xs h-9"><Upload className="w-4 h-4" /> Add Document</Button>} />
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleAddDocument}>
                <DialogHeader>
                  <DialogTitle>Attach Verification Document</DialogTitle>
                  <DialogDescription>
                    Add a file reference URL for CNIC copy, utility bill, or medical report.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Document Title / Label *</Label>
                    <Input
                      required
                      placeholder="e.g. Beneficiary CNIC Copy"
                      value={docLabel}
                      onChange={(e) => setDocLabel(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Document Category</Label>
                    <Select value={docType} onValueChange={(val) => val && setDocType(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CNIC">CNIC Copy</SelectItem>
                        <SelectItem value="B_FORM">B-Form (Children)</SelectItem>
                        <SelectItem value="PROOF_OF_RESIDENCE">Utility Bill (Electricity/Gas)</SelectItem>
                        <SelectItem value="PROOF_OF_INCOME">Income Certificate</SelectItem>
                        <SelectItem value="MEDICAL_REPORT">Medical Report</SelectItem>
                        <SelectItem value="OTHER">Other Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">File URL / Storage Link *</Label>
                    <Input
                      required
                      type="url"
                      placeholder="https://example.com/files/cnic-front.pdf"
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDocDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Attach Document
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Link
            href={`/dashboard/beneficiaries/${beneficiary.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs h-9" })}
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Hero Overview Header Card */}
      <Card className="border-border shadow-xs overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-extrabold text-xl">
                  {getInitials(beneficiary.name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {beneficiary.name}
                  </h1>
                  <StatusBadge status={beneficiary.status} isVerified={isVerified} />
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  {beneficiary.cnic && (
                    <button
                      onClick={() => copyToClipboard(beneficiary.cnic!, "cnic")}
                      className="font-mono bg-muted hover:bg-muted/80 px-2 py-1 rounded font-semibold text-foreground inline-flex items-center gap-1 transition-colors"
                      title="Click to copy CNIC"
                    >
                      CNIC: {beneficiary.cnic}
                      {copiedCnic ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </button>
                  )}
                  {beneficiary.contact?.phone && (
                    <button
                      onClick={() => copyToClipboard(beneficiary.contact!.phone!, "phone")}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      title="Click to copy phone"
                    >
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      {beneficiary.contact.phone}
                      {copiedPhone ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </button>
                  )}
                  {beneficiary.address?.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {beneficiary.address.city}
                      {beneficiary.address.province ? `, ${beneficiary.address.province}` : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border shrink-0">
              <div>
                <span className="text-xs text-muted-foreground block">Total Aid Received</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatPKR(totalAidAmount)}
                </span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <span className="text-xs text-muted-foreground block">Assistance Records</span>
                <span className="text-base font-bold text-foreground">
                  {beneficiary.assistanceHistory.length} Record{beneficiary.assistanceHistory.length !== 1 && "s"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full bg-card p-1 rounded-xl border border-border h-auto">
          <TabsTrigger value="overview" className="gap-1.5 text-xs py-2">
            <User className="w-3.5 h-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5 text-xs py-2">
            <Phone className="w-3.5 h-3.5" /> Contact
          </TabsTrigger>
          <TabsTrigger value="family" className="gap-1.5 text-xs py-2">
            <Users className="w-3.5 h-3.5" /> Family & Eco
          </TabsTrigger>
          <TabsTrigger value="aid" className="gap-1.5 text-xs py-2">
            <History className="w-3.5 h-3.5" /> Aid ({beneficiary.assistanceHistory.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5 text-xs py-2">
            <FolderOpen className="w-3.5 h-3.5" /> Docs ({beneficiary.documents.length})
          </TabsTrigger>
          <TabsTrigger value="cases" className="gap-1.5 text-xs py-2">
            <FileText className="w-3.5 h-3.5" /> Cases ({beneficiary.cases.length})
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-muted-foreground block">Full Name</span>
                    <span className="font-semibold text-foreground text-sm">{beneficiary.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Father / Husband</span>
                    <span className="font-semibold text-foreground">{beneficiary.fatherName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">CNIC</span>
                    <span className="font-mono font-semibold text-foreground">{beneficiary.cnic || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Gender</span>
                    <span className="font-semibold text-foreground uppercase">{beneficiary.gender || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Date of Birth</span>
                    <span className="font-semibold text-foreground">
                      {beneficiary.dateOfBirth
                        ? new Date(beneficiary.dateOfBirth).toLocaleDateString("en-PK")
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Registered On</span>
                    <span className="font-semibold text-foreground">
                      {new Date(beneficiary.registeredAt).toLocaleDateString("en-PK")}
                    </span>
                  </div>
                </div>

                {beneficiary.notes && (
                  <div className="pt-3 border-t border-border">
                    <span className="text-muted-foreground block mb-1 font-semibold">Special Remarks & Notes</span>
                    <p className="p-3 rounded-lg bg-muted/40 text-foreground leading-relaxed">
                      {beneficiary.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Verification & Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span>Verification Status</span>
                  <StatusBadge showVerifiedOnly isVerified={isVerified} status={beneficiary.status} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span>Current System Status</span>
                  <StatusBadge status={beneficiary.status} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span>Family Dependents</span>
                  <span className="font-bold text-foreground text-sm">
                    {beneficiary.family?.dependents || 0} Members
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span>Monthly Household Income</span>
                  <span className="font-bold text-foreground text-sm">
                    {beneficiary.economic?.monthlyIncome ? formatPKR(beneficiary.economic.monthlyIncome) : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CONTACT TAB */}
        <TabsContent value="contact">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact & Residential Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-primary flex items-center gap-1.5">
                    <Phone className="w-4 h-4" /> Phone & Online Channels
                  </h4>
                  <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Primary Mobile:</span>
                      <span className="font-semibold text-foreground">{beneficiary.contact?.phone || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-border/40">
                      <span className="text-muted-foreground">Alternate Phone:</span>
                      <span className="font-semibold text-foreground">{beneficiary.contact?.phone2 || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-border/40">
                      <span className="text-muted-foreground">WhatsApp:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{beneficiary.contact?.whatsapp || "N/A"}</span>
                        {beneficiary.contact?.whatsapp && (
                          <a
                            href={`https://wa.me/${beneficiary.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants({ variant: "outline", size: "sm", className: "h-6 text-[10px] px-2 border-emerald-500/30 text-emerald-600 gap-1" })}
                          >
                            <MessageSquare className="w-3 h-3" /> Chat
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-border/40">
                      <span className="text-muted-foreground">Email Address:</span>
                      <span className="font-semibold text-foreground">{beneficiary.contact?.email || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-rose-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Postal & Permanent Address
                  </h4>
                  <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Street Address:</span>
                      <span className="font-semibold text-foreground">{beneficiary.address?.street || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-border/40">
                      <span className="text-muted-foreground">City:</span>
                      <span className="font-semibold text-foreground">{beneficiary.address?.city || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-border/40">
                      <span className="text-muted-foreground">District:</span>
                      <span className="font-semibold text-foreground">{beneficiary.address?.district || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-border/40">
                      <span className="text-muted-foreground">Province:</span>
                      <span className="font-semibold text-foreground">{beneficiary.address?.province || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-border/40">
                      <span className="text-muted-foreground">Postal Code:</span>
                      <span className="font-semibold text-foreground">{beneficiary.address?.postalCode || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAMILY & ECO TAB */}
        <TabsContent value="family">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Family Vulnerability Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                    <span className="text-muted-foreground block">Marital Status</span>
                    <span className="text-sm font-bold text-foreground uppercase">{beneficiary.family?.maritalStatus || "N/A"}</span>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                    <span className="text-muted-foreground block">Spouse Name</span>
                    <span className="text-sm font-bold text-foreground">{beneficiary.family?.spouseName || "N/A"}</span>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                    <span className="text-muted-foreground block">Total Dependents</span>
                    <span className="text-lg font-bold text-foreground">{beneficiary.family?.dependents || 0}</span>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                    <span className="text-muted-foreground block">Disabled Members</span>
                    <span className="text-lg font-bold text-foreground">{beneficiary.family?.disabledMembers || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BadgeDollarSign className="w-4 h-4 text-emerald-500" /> Economic & Living Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Employment Status:</span>
                    <span className="font-semibold text-foreground uppercase">{beneficiary.economic?.employmentStatus || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-border/40">
                    <span className="text-muted-foreground">Occupation / Craft:</span>
                    <span className="font-semibold text-foreground">{beneficiary.economic?.occupation || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-border/40">
                    <span className="text-muted-foreground">Est. Household Income:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {beneficiary.economic?.monthlyIncome ? formatPKR(beneficiary.economic.monthlyIncome) : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-border/40">
                    <span className="text-muted-foreground">Housing Type:</span>
                    <span className="font-semibold text-foreground uppercase">{beneficiary.economic?.housingType || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ASSISTANCE HISTORY TAB */}
        <TabsContent value="aid">
          <Card className="border-border shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Assistance History Log</CardTitle>
                <CardDescription className="text-xs">
                  Complete historical log of cash grants, food rations, and medical aid provided to this beneficiary.
                </CardDescription>
              </div>

              <Button
                size="sm"
                onClick={() => setAidDialogOpen(true)}
                className="gap-1.5 text-xs h-8 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Record Aid
              </Button>
            </CardHeader>
            <CardContent>
              <AssistanceTimeline items={beneficiary.assistanceHistory} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents">
          <Card className="border-border shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Verification Documents & Certificates</CardTitle>
                <CardDescription className="text-xs">
                  Attached CNICs, income certificates, B-Forms, and utility bill references.
                </CardDescription>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setDocDialogOpen(true)}
                className="gap-1.5 text-xs h-8"
              >
                <Upload className="w-3.5 h-3.5" /> Attach Document
              </Button>
            </CardHeader>
            <CardContent>
              {beneficiary.documents.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-xl bg-muted/30">
                  <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-foreground">No documents attached yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click &quot;Attach Document&quot; to add CNIC copies, bills, or medical reports.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {beneficiary.documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      id={doc.id}
                      beneficiaryId={beneficiary.id}
                      label={doc.label}
                      type={doc.type}
                      fileUrl={doc.fileUrl}
                      uploadedAt={doc.uploadedAt}
                      onDelete={() => router.refresh()}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CASES TAB */}
        <TabsContent value="cases">
          <Card className="border-border shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Special Cases & Emergency Requests</CardTitle>
                <CardDescription className="text-xs">
                  Open appeals for medical emergency funds, wedding grants, or house repair aid.
                </CardDescription>
              </div>

              <Dialog open={caseDialogOpen} onOpenChange={setCaseDialogOpen}>
                <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"><Plus className="w-3.5 h-3.5" /> Open New Case</Button>} />
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleAddCase}>
                    <DialogHeader>
                      <DialogTitle>Open Special Case / Appeal</DialogTitle>
                      <DialogDescription>
                        Register a special request or medical appeal for this beneficiary.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Case Title *</Label>
                        <Input
                          required
                          placeholder="e.g. Urgent Eye Surgery Support Request"
                          value={caseTitle}
                          onChange={(e) => setCaseTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Case Description</Label>
                        <Textarea
                          rows={3}
                          placeholder="Provide details about the medical emergency or financial need..."
                          value={caseDesc}
                          onChange={(e) => setCaseDesc(e.target.value)}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setCaseDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isPending}>
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Create Case
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {beneficiary.cases.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-xl bg-muted/30">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-foreground">No active cases or appeals logged</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click &quot;Open New Case&quot; to log an urgent medical appeal or emergency aid request.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {beneficiary.cases.map((c) => (
                    <Card key={c.id} className="border-border shadow-xs">
                      <CardContent className="p-4 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={c.isOpen ? "default" : "secondary"} className="text-[10px]">
                              {c.isOpen ? "OPEN CASE" : "RESOLVED"}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Opened {new Date(c.openedAt).toLocaleDateString("en-PK")}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm text-foreground mt-1">{c.title}</h4>
                          {c.description && (
                            <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
