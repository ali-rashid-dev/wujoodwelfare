"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Loader2, ShieldCheck, Save } from "lucide-react";
import { addCaseAssessment } from "@/app/(dashboard)/dashboard/cases/case-actions";
import { toast } from "sonner";

interface AddAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseTitle: string;
  onSuccess?: () => void;
}

export function AddAssessmentModal({
  isOpen,
  onClose,
  caseId,
  caseTitle,
  onSuccess,
}: AddAssessmentModalProps) {
  const [vulnerabilityScore, setVulnerabilityScore] = useState(50);
  const [financialNeedScore, setFinancialNeedScore] = useState(50);
  const [recommendation, setRecommendation] = useState("");
  const [findings, setFindings] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recommendation || recommendation.trim().length < 5) {
      toast.error("Please enter a recommendation (at least 5 characters).");
      return;
    }

    setSubmitting(true);
    const res = await addCaseAssessment(caseId, {
      vulnerabilityScore,
      financialNeedScore,
      recommendation: recommendation.trim(),
      findings: findings.trim() || undefined,
    });
    setSubmitting(false);

    if (res.success) {
      toast.success("Case assessment successfully recorded!");
      setRecommendation("");
      setFindings("");
      onSuccess?.();
      onClose();
    } else {
      toast.error(res.error || "Failed to add assessment");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-indigo-600" /> Record Case Assessment
          </DialogTitle>
          <DialogDescription className="text-xs">
            Evaluate vulnerability & financial need scores for <strong className="text-foreground">{caseTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Vulnerability Score Slider */}
          <div className="space-y-2 bg-muted/20 p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Vulnerability Score (1 - 100)</Label>
              <span className="font-bold text-sm text-primary">{vulnerabilityScore} / 100</span>
            </div>
            <Slider
              value={[vulnerabilityScore]}
              onValueChange={(val) => setVulnerabilityScore(typeof val === "number" ? val : val[0] ?? 0)}
              min={0}
              max={100}
              step={1}
            />
            <span className="text-[10px] text-muted-foreground block">
              Higher score indicates greater household vulnerability (elderly, disabled, orphans).
            </span>
          </div>

          {/* Financial Need Score Slider */}
          <div className="space-y-2 bg-muted/20 p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Financial Need Score (1 - 100)</Label>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{financialNeedScore} / 100</span>
            </div>
            <Slider
              value={[financialNeedScore]}
              onValueChange={(val) => setFinancialNeedScore(typeof val === "number" ? val : val[0] ?? 0)}
              min={0}
              max={100}
              step={1}
            />
            <span className="text-[10px] text-muted-foreground block">
              Higher score indicates urgent financial distress and debt burden.
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assess-rec" className="text-xs font-semibold">
              Case Worker Recommendation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="assess-rec"
              placeholder="e.g. Recommend immediate approval for PKR 20,000 emergency medical grant and dry ration enrollment."
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              required
              className="text-xs min-h-[70px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assess-findings" className="text-xs font-semibold">
              Assessment Findings & Analysis (Optional)
            </Label>
            <Textarea
              id="assess-findings"
              placeholder="Detail family living conditions, income verification checks, or inspector observations..."
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              className="text-xs min-h-[70px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !recommendation.trim()}
              className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Save Assessment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
