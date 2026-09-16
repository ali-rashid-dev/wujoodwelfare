"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, FileText, User, BookOpen, AlertTriangle, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { createApplication, updateApplication } from "@/app/(dashboard)/dashboard/applications/application-actions";
import { ApplicationFormInput } from "@/validation/application";
import { ApplicationPriority, AssistanceType } from "@prisma/client";
import { toast } from "sonner";

interface ApplicationFormProps {
  beneficiaries: Array<{ id: string; name: string; cnic: string | null; phone: string | null; status: string }>;
  programs: Array<{ id: string; name: string; code: string; assistanceType: string; requiredDocuments: string[] }>;
  initialData?: {
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
  };
  isEditing?: boolean;
}

const ALL_ASSISTANCE_TYPES = [
  { value: "FOOD", label: "Food Assistance" },
  { value: "MEDICAL", label: "Medical Assistance" },
  { value: "EDUCATION", label: "Education Support" },
  { value: "ORPHAN_SUPPORT", label: "Orphan Support" },
  { value: "DISABILITY_SUPPORT", label: "Disability Support" },
  { value: "EMERGENCY_RELIEF", label: "Emergency Relief" },
  { value: "HOUSING", label: "Housing Support" },
  { value: "MARRIAGE_ASSISTANCE", label: "Marriage Assistance" },
  { value: "EMPLOYMENT_SUPPORT", label: "Employment Support" },
  { value: "MONTHLY_FINANCIAL_AID", label: "Monthly Financial Aid" },
  { value: "FINANCIAL", label: "General Financial Aid" },
  { value: "CLOTHING", label: "Clothing Support" },
  { value: "OTHER", label: "Other Support" },
];

export function ApplicationForm({ beneficiaries, programs, initialData, isEditing = false }: ApplicationFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [docInput, setDocInput] = useState("");

  const [formData, setFormData] = useState<ApplicationFormInput>({
    beneficiaryId: initialData?.beneficiaryId ?? "",
    programId: initialData?.programId || "",
    assistanceType: (initialData?.assistanceType as AssistanceType) || "FINANCIAL",
    requestedAmount: initialData?.requestedAmount ?? undefined,
    requestedItems: initialData?.requestedItems || "",
    reason: initialData?.reason || "",
    priority: (initialData?.priority as ApplicationPriority) || "MEDIUM",
    documents: initialData?.documents || [],
  });

  const selectedProgram = programs.find((p) => p.id === formData.programId);

  const handleProgramSelect = (programId: string) => {
    const prog = programs.find((p) => p.id === programId);
    setFormData((prev) => ({
      ...prev,
      programId,
      assistanceType: prog ? (prog.assistanceType as AssistanceType) : prev.assistanceType,
    }));
  };

  const handleAddDocument = () => {
    if (!docInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, docInput.trim()],
    }));
    setDocInput("");
  };

  const handleRemoveDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.beneficiaryId) {
      toast.error("Please select a beneficiary.");
      return;
    }
    if (!formData.reason || formData.reason.length < 10) {
      toast.error("Please enter a detailed hardship narrative (at least 10 characters).");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && initialData) {
        const res = await updateApplication(initialData.id, formData);
        setSubmitting(false);
        if (res.success) {
          toast.success("Application updated successfully!");
          router.push(`/dashboard/applications/${initialData.id}`);
        } else {
          toast.error(res.error || "Failed to update application");
        }
      } else {
        const res = await createApplication(formData);
        setSubmitting(false);
        if (res.success) {
          toast.success("Assistance application submitted successfully!");
          router.push(`/dashboard/applications/${res.id}`);
        } else {
          toast.error(res.error || "Failed to submit application");
        }
      }
    } catch {
      setSubmitting(false);
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {isEditing ? `Edit Application: ${initialData?.applicationCode}` : "Submit New Welfare Assistance Application"}
            </CardTitle>
            <CardDescription className="text-xs">
              Request welfare financial aid, dry ration supplies, or specialized support on behalf of a registered beneficiary.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Section 1: Beneficiary & Program Selection */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                <User className="h-4 w-4 text-primary" /> Applicant & Welfare Program
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="app-beneficiary" className="text-xs font-semibold">
                    Select Beneficiary <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.beneficiaryId}
                    onValueChange={(val) => setFormData({ ...formData, beneficiaryId: val || "" })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select beneficiary..." />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiaries.map((b) => (
                        <SelectItem key={b.id} value={b.id} className="text-xs">
                          {b.name} {b.cnic ? `(CNIC: ${b.cnic})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="app-program" className="text-xs font-semibold">
                    Target Welfare Program (Optional)
                  </Label>
                  <Select
                    value={formData.programId || "NONE"}
                    onValueChange={(val) => handleProgramSelect(val === "NONE" ? "" : val || "")}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="General Assistance (No Specific Program)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE" className="text-xs">
                        General Assistance (No Specific Program)
                      </SelectItem>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name} ({p.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Display Program Required Documents info if program selected */}
              {selectedProgram && selectedProgram.requiredDocuments?.length > 0 && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-1.5">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" /> Required Verification Documents for {selectedProgram.name}:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedProgram.requiredDocuments.map((doc) => (
                      <Badge key={doc} variant="outline" className="text-[10px] bg-background">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> {doc.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Requested Assistance Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                <FileText className="h-4 w-4 text-emerald-600" /> Requested Assistance & Urgency
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Assistance Type</Label>
                  <Select
                    value={formData.assistanceType}
                    onValueChange={(val) => setFormData({ ...formData, assistanceType: val || "FINANCIAL" })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_ASSISTANCE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="text-xs">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="app-amount" className="text-xs font-semibold">
                    Requested Amount (PKR)
                  </Label>
                  <Input
                    id="app-amount"
                    type="number"
                    min="0"
                    placeholder="e.g. 25000"
                    value={formData.requestedAmount ?? ""}
                    onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value === "" ? undefined : Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Application Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(val) => setFormData({ ...formData, priority: (val || "MEDIUM") as ApplicationPriority })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select priority..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW" className="text-xs">Low Priority</SelectItem>
                      <SelectItem value="MEDIUM" className="text-xs">Medium Priority</SelectItem>
                      <SelectItem value="HIGH" className="text-xs">High Priority</SelectItem>
                      <SelectItem value="URGENT" className="text-xs text-destructive font-semibold">
                        Urgent Emergency
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-3">
                  <Label htmlFor="app-items" className="text-xs font-semibold">
                    Requested Items / Package Details (Optional)
                  </Label>
                  <Input
                    id="app-items"
                    placeholder="e.g. 1 Month Dry Ration Package + PKR 10,000 Medicine Allowance"
                    value={formData.requestedItems || ""}
                    onChange={(e) => setFormData({ ...formData, requestedItems: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Hardship Reason Narrative */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Hardship Narrative & Reason
              </h3>

              <div className="space-y-1.5">
                <Label htmlFor="app-reason" className="text-xs font-semibold">
                  Detailed Hardship Reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="app-reason"
                  placeholder="Explain the family situation, monthly income constraints, medical condition, or why emergency aid is requested..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  className="text-xs min-h-[110px]"
                />
              </div>
            </div>

            {/* Section 4: Document Attachments */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                <FileText className="h-4 w-4 text-purple-600" /> Supporting Document Links
              </h3>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste document URL or file link (e.g. CNIC copy, medical bill link)..."
                    value={docInput}
                    onChange={(e) => setDocInput(e.target.value)}
                    className="text-xs flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddDocument} className="text-xs gap-1">
                    <Plus className="h-3.5 w-3.5" /> Attach
                  </Button>
                </div>

                {formData.documents && formData.documents.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {formData.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-md border border-border bg-muted/20 text-xs"
                      >
                        <span className="truncate text-foreground font-mono text-[11px]">{doc}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove document ${doc}`}
                          onClick={() => handleRemoveDocument(idx)}
                          className="h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting} className="text-xs gap-1.5 font-semibold">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> {isEditing ? "Save Changes" : "Submit Application"}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
