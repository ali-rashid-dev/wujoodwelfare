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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UserCheck, Send } from "lucide-react";
import { addCaseVisit } from "@/app/(dashboard)/dashboard/cases/case-actions";
import { toast } from "sonner";
import { formatLocalDate } from "@/components/cases/ScheduleFollowUpModal";

interface LogVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseTitle: string;
}

export function LogVisitModal({
  isOpen,
  onClose,
  caseId,
  caseTitle,
}: LogVisitModalProps) {
  const [visitDate, setVisitDate] = useState(() => formatLocalDate(new Date()));
  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("Home Inspection & Document Verification");
  const [findings, setFindings] = useState("");
  const [outcome, setOutcome] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose || !findings || findings.trim().length < 5) {
      toast.error("Please fill in visit purpose and detailed findings.");
      return;
    }

    setSubmitting(true);
    const res = await addCaseVisit(caseId, {
      visitDate,
      location: location.trim() || undefined,
      purpose: purpose.trim(),
      findings: findings.trim(),
      outcome: outcome.trim() || undefined,
    });
    setSubmitting(false);

    if (res.success) {
      toast.success("Field visit report logged successfully!");
      setFindings("");
      setOutcome("");
      onClose();
    } else {
      toast.error(res.error || "Failed to log visit");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <UserCheck className="h-5 w-5 text-amber-600" /> Log Field / Home Visit
          </DialogTitle>
          <DialogDescription className="text-xs">
            Record field inspection report and observations for <strong className="text-foreground">{caseTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="visit-date" className="text-xs font-semibold">
                Visit Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="visit-date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="visit-loc" className="text-xs font-semibold">
                Visit Location / Address
              </Label>
              <Input
                id="visit-loc"
                placeholder="e.g. House #14, St 3, Orangi Town"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="visit-purpose" className="text-xs font-semibold">
              Visit Purpose <span className="text-destructive">*</span>
            </Label>
            <Input
              id="visit-purpose"
              placeholder="e.g. Verification of medical bills and household living condition"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="visit-findings" className="text-xs font-semibold">
              Visit Findings & Observations <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="visit-findings"
              placeholder="Detail observations made during field visit, physical condition, interviewed family members..."
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              required
              className="text-xs min-h-[90px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="visit-outcome" className="text-xs font-semibold">
              Visit Outcome / Field Recommendation (Optional)
            </Label>
            <Input
              id="visit-outcome"
              placeholder="e.g. Verified genuine hardship. Recommend immediate ration kit."
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !findings.trim()}
              className="text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Logging...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Log Visit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
