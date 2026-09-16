"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Loader2, BookOpen, FileCheck, DollarSign, Calendar, Target } from "lucide-react";
import { createProgram, updateProgram } from "@/app/(dashboard)/dashboard/programs/program-actions";
import { ProgramFormInput } from "@/validation/program";
import { ProgramStatus, AssistanceType, DocumentType } from "@prisma/client";
import { toast } from "sonner";

interface ProgramFormProps {
  initialData?: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    eligibilityCriteria: string | null;
    budget: number;
    startDate: string;
    endDate: string | null;
    status: string;
    assistanceType: string;
    requiredDocuments: string[];
    targetBeneficiaries: number | null;
    maxBeneficiaries: number | null;
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

const ALL_DOCUMENT_TYPES = [
  { value: "CNIC", label: "National ID (CNIC / Smart Card)" },
  { value: "B_FORM", label: "NADRA B-Form (Child Record)" },
  { value: "PROOF_OF_INCOME", label: "Proof of Income / Salary Certificate" },
  { value: "PROOF_OF_RESIDENCE", label: "Proof of Residence / Rent Agreement" },
  { value: "MEDICAL_REPORT", label: "Medical Report / Hospital Prescriptions" },
  { value: "ORPHAN_CERTIFICATE", label: "Death Certificate of Parent / Orphan Record" },
  { value: "DISABILITY_CERTIFICATE", label: "Official Disability Certificate" },
  { value: "MARRIAGE_CERTIFICATE", label: "Nikahnama / Marriage Invitation Card" },
  { value: "JOB_APPLICATION", label: "Employment Application / Skill Verification" },
  { value: "ACADEMIC_RECORD", label: "School Marksheet / Fee Voucher" },
  { value: "OTHER", label: "Other Supporting Documents" },
];

export function ProgramForm({ initialData, isEditing = false }: ProgramFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const formatDateForInput = (isoStr?: string | null) => {
    if (!isoStr) return "";
    try {
      return new Date(isoStr).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const [formData, setFormData] = useState<ProgramFormInput>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    eligibilityCriteria: initialData?.eligibilityCriteria || "",
    budget: initialData?.budget || 0,
    startDate: formatDateForInput(initialData?.startDate) || new Date().toISOString().split("T")[0],
    endDate: formatDateForInput(initialData?.endDate) || "",
    status: (initialData?.status as ProgramStatus) || "ACTIVE",
    assistanceType: (initialData?.assistanceType as AssistanceType) || "FINANCIAL",
    requiredDocuments: (initialData?.requiredDocuments as DocumentType[]) || [
      "CNIC",
      "PROOF_OF_INCOME",
      "PROOF_OF_RESIDENCE",
    ],
    targetBeneficiaries: initialData?.targetBeneficiaries || undefined,
    maxBeneficiaries: initialData?.maxBeneficiaries || undefined,
  });

  const handleDocumentToggle = (docValue: string) => {
    const docTyped = docValue as DocumentType;
    setFormData((prev) => {
      const current = prev.requiredDocuments || [];
      const exists = current.includes(docTyped);
      if (exists) {
        return {
          ...prev,
          requiredDocuments: current.filter((d) => d !== docTyped),
        };
      } else {
        return {
          ...prev,
          requiredDocuments: [...current, docTyped],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditing && initialData) {
        const res = await updateProgram(initialData.id, formData);
        setSubmitting(false);
        if (res.success) {
          toast.success("Welfare program updated successfully!");
          router.push(`/dashboard/programs/${initialData.id}`);
        } else {
          toast.error(res.error || "Failed to update program");
        }
      } else {
        const res = await createProgram(formData);
        setSubmitting(false);
        if (res.success) {
          toast.success("Welfare program created successfully!");
          router.push(`/dashboard/programs/${res.id}`);
        } else {
          toast.error(res.error || "Failed to create program");
        }
      }
    } catch {
      setSubmitting(false);
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Programs
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              {isEditing ? `Edit Program: ${initialData?.name}` : "Create New Welfare Program"}
            </CardTitle>
            <CardDescription className="text-xs">
              Configure central program details, budget allocation, eligibility criteria, and required verification documents.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                <BookOpen className="h-4 w-4 text-primary" /> Basic Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="prog-name" className="text-xs font-semibold">
                    Program Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="prog-name"
                    placeholder="e.g. Monthly Food & Ration Assistance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Assistance Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.assistanceType}
                    onValueChange={(val) => setFormData({ ...formData, assistanceType: (val || "FINANCIAL") as AssistanceType })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select assistance type..." />
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
                  <Label className="text-xs font-semibold">
                    Program Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: (val || "ACTIVE") as ProgramStatus })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE" className="text-xs">
                        Active (Accepting Beneficiaries)
                      </SelectItem>
                      <SelectItem value="DRAFT" className="text-xs">
                        Draft (Internal Planning)
                      </SelectItem>
                      <SelectItem value="PAUSED" className="text-xs">
                        Paused (Temporarily Suspended)
                      </SelectItem>
                      <SelectItem value="COMPLETED" className="text-xs">
                        Completed (Fully Disbursed)
                      </SelectItem>
                      <SelectItem value="CANCELLED" className="text-xs">
                        Cancelled
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Budget & Beneficiary Targets */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                <DollarSign className="h-4 w-4 text-emerald-600" /> Budget & Capacity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prog-budget" className="text-xs font-semibold">
                    Total Allocated Budget (PKR) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="prog-budget"
                    type="number"
                    min="0"
                    placeholder="e.g. 5000000"
                    value={formData.budget || ""}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prog-target-ben" className="text-xs font-semibold">
                    Target Beneficiaries (Optional)
                  </Label>
                  <Input
                    id="prog-target-ben"
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={formData.targetBeneficiaries || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetBeneficiaries: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prog-max-ben" className="text-xs font-semibold">
                    Max Capacity Limit (Optional)
                  </Label>
                  <Input
                    id="prog-max-ben"
                    type="number"
                    min="0"
                    placeholder="e.g. 1000"
                    value={formData.maxBeneficiaries || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxBeneficiaries: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Schedule & Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                <Calendar className="h-4 w-4 text-blue-600" /> Schedule & Duration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prog-start-date" className="text-xs font-semibold">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="prog-start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prog-end-date" className="text-xs font-semibold">
                    End Date (Optional)
                  </Label>
                  <Input
                    id="prog-end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Description & Eligibility Criteria */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                <Target className="h-4 w-4 text-purple-600" /> Details & Eligibility
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prog-desc" className="text-xs font-semibold">
                    Program Overview / Scope Description
                  </Label>
                  <Textarea
                    id="prog-desc"
                    placeholder="Describe the goals, items disbursemnt methodology, and objectives..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="text-xs min-h-[90px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prog-criteria" className="text-xs font-semibold">
                    Eligibility Criteria Rules
                  </Label>
                  <Textarea
                    id="prog-criteria"
                    placeholder="Specify income brackets, family conditions, priority demographics..."
                    value={formData.eligibilityCriteria}
                    onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                    className="text-xs min-h-[90px]"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Required Verification Documents */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                <FileCheck className="h-4 w-4 text-amber-600" /> Required Verification Documents
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-4 rounded-xl border border-border">
                {ALL_DOCUMENT_TYPES.map((doc) => {
                  const isChecked = formData.requiredDocuments?.includes(doc.value as DocumentType);
                  return (
                    <div
                      key={doc.value}
                      onClick={() => handleDocumentToggle(doc.value)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer text-xs ${
                        isChecked
                          ? "bg-primary/10 border-primary/40 text-foreground font-semibold"
                          : "bg-card border-border text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      <Checkbox
                        id={`doc-${doc.value}`}
                        checked={isChecked}
                        onCheckedChange={() => handleDocumentToggle(doc.value)}
                      />
                      <label htmlFor={`doc-${doc.value}`} className="cursor-pointer flex-1">
                        {doc.label}
                      </label>
                    </div>
                  );
                })}
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
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> {isEditing ? "Save Changes" : "Create Program"}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
