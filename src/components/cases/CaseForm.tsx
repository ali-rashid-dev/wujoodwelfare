"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Loader2,
  Briefcase,
  User,
  AlertTriangle,
  Plus,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { createCase, updateCase } from "@/app/(dashboard)/dashboard/cases/case-actions";
import { CaseFormInput } from "@/validation/case";
import { toast } from "sonner";

interface CaseFormProps {
  beneficiaries: Array<{ id: string; name: string; cnic: string | null; phone: string | null; status: string }>;
  staffList: Array<{ id: string; name: string; designation: string; department: string }>;
  initialData?: {
    id: string;
    caseNumber: string;
    beneficiaryId: string;
    title: string;
    category: string;
    priority: string;
    description: string | null;
    documents: string[];
    assignments: Array<{ staffId: string; staff: { name: string } }>;
  };
  isEditing?: boolean;
}

const CASE_CATEGORIES = [
  "GENERAL",
  "FOOD",
  "MEDICAL",
  "EDUCATION",
  "HOUSING",
  "EMPLOYMENT",
  "DISABILITY",
  "ORPHAN",
  "FINANCIAL",
  "EMERGENCY",
  "MARRIAGE",
  "OTHER",
];

const CASE_PRIORITIES = [
  { value: "LOW", label: "Low", color: "bg-slate-100 text-slate-700" },
  { value: "MEDIUM", label: "Medium", color: "bg-blue-100 text-blue-700" },
  { value: "HIGH", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "URGENT", label: "Urgent", color: "bg-red-100 text-red-700" },
];

export function CaseForm({ beneficiaries, staffList, initialData, isEditing = false }: CaseFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [docInput, setDocInput] = useState("");

  const [formData, setFormData] = useState<CaseFormInput>({
    beneficiaryId: initialData?.beneficiaryId ?? "",
    title: initialData?.title ?? "",
    category: initialData?.category ?? "GENERAL",
    priority: (initialData?.priority ?? "MEDIUM") as CaseFormInput["priority"],
    description: initialData?.description ?? "",
    assignedStaffId: initialData?.assignments?.[0]?.staffId ?? "",
    documents: initialData?.documents ?? [],
  });

  const updateField = <K extends keyof CaseFormInput>(field: K, value: CaseFormInput[K]) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const addDocument = () => {
    const trimmed = docInput.trim();
    if (trimmed && !formData.documents?.includes(trimmed)) {
      updateField("documents", [...(formData.documents ?? []), trimmed]);
      setDocInput("");
    }
  };

  const removeDocument = (doc: string) =>
    updateField("documents", (formData.documents ?? []).filter((d) => d !== doc));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.beneficiaryId) {
      toast.error("Please select a beneficiary.");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Case title is required.");
      return;
    }
    if (formData.title.trim().length < 3) {
      toast.error("Case title must be at least 3 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = isEditing && initialData
        ? await updateCase(initialData.id, formData)
        : await createCase(formData);

      if (res.success) {
        toast.success(isEditing ? "Case updated successfully!" : "Case opened successfully!");
        const destinationId = "id" in res ? res.id : initialData?.id;
        router.push(destinationId ? `/dashboard/cases/${destinationId}` : "/dashboard/cases");
      } else {
        toast.error((res as { error?: string }).error ?? "Operation failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {isEditing ? `Edit Case — ${initialData?.caseNumber}` : "Open New Case"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Update case details, priority, or assignment."
              : "Create a new case to begin the welfare assessment process."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Core Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-primary" /> Case Information
            </CardTitle>
            <CardDescription className="text-xs">Basic details about this case.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Beneficiary */}
            <div className="space-y-1.5">
              <Label htmlFor="case-beneficiary" className="text-xs font-semibold">
                Beneficiary <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.beneficiaryId}
                onValueChange={(v) => updateField("beneficiaryId", v ?? "")}
              >
                <SelectTrigger id="case-beneficiary" className="text-xs h-9">
                  <SelectValue placeholder="Select beneficiary..." />
                </SelectTrigger>
                <SelectContent>
                  {beneficiaries.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-xs">
                      {b.name}
                      {b.cnic ? ` — ${b.cnic}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="case-title" className="text-xs font-semibold">
                Case Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="case-title"
                placeholder="e.g. Medical Assistance — Surgery Cost for Cardiac Patient"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="case-category" className="text-xs font-semibold">
                  Category
                </Label>
                <Select
                  value={formData.category ?? "GENERAL"}
                  onValueChange={(v) => updateField("category", v ?? "GENERAL")}
                >
                  <SelectTrigger id="case-category" className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat.charAt(0) + cat.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="case-priority" className="text-xs font-semibold">
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => updateField("priority", v as CaseFormInput["priority"])}
                >
                  <SelectTrigger id="case-priority" className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="text-xs">
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="case-desc" className="text-xs font-semibold">
                Description / Summary
              </Label>
              <Textarea
                id="case-desc"
                placeholder="Describe the nature of this case, background, and immediate needs..."
                value={formData.description ?? ""}
                onChange={(e) => updateField("description", e.target.value)}
                className="text-xs min-h-[90px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Case Officer Assignment
            </CardTitle>
            <CardDescription className="text-xs">
              Assign a case worker to handle this case. Can be updated later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="case-staff" className="text-xs font-semibold">
                Assigned Case Worker (Optional)
              </Label>
              <Select
                value={formData.assignedStaffId ?? ""}
                onValueChange={(v) => updateField("assignedStaffId", v || undefined)}
              >
                <SelectTrigger id="case-staff" className="text-xs h-9">
                  <SelectValue placeholder="Assign later..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-xs text-muted-foreground">
                    — Unassigned —
                  </SelectItem>
                  {staffList.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.name} — {s.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" /> Required Documents
            </CardTitle>
            <CardDescription className="text-xs">
              List documents the beneficiary needs to provide.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. National ID Card Copy"
                value={docInput}
                onChange={(e) => setDocInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDocument();
                  }
                }}
                className="text-xs flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDocument}
                className="shrink-0 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>

            {formData.documents && formData.documents.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.documents.map((doc) => (
                  <Badge
                    key={doc}
                    variant="secondary"
                    className="text-xs gap-1 pr-1.5 cursor-default"
                  >
                    {doc}
                    <button
                      type="button"
                      onClick={() => removeDocument(doc)}
                      className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <Card>
          <CardFooter className="flex justify-between pt-4 pb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="text-xs gap-1.5 font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {isEditing ? "Saving..." : "Opening..."}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <>
                      <Save className="h-3.5 w-3.5" /> Save Changes
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-3.5 w-3.5" /> Open Case
                    </>
                  )}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
