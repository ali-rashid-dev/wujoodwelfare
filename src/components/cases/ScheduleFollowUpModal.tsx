"use client";

import React, { useEffect, useState } from "react";
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
import { Loader2, CalendarClock, Send } from "lucide-react";
import { scheduleCaseFollowUp } from "@/app/(dashboard)/dashboard/cases/case-actions";
import { toast } from "sonner";

interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseTitle: string;
  currentFollowUpDate?: string | null;
}

export const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getFollowUpDate = (currentFollowUpDate?: string | null) => {
  if (currentFollowUpDate) return formatLocalDate(new Date(currentFollowUpDate));
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  return formatLocalDate(defaultDate);
};

export function ScheduleFollowUpModal({
  isOpen,
  onClose,
  caseId,
  caseTitle,
  currentFollowUpDate,
}: ScheduleFollowUpModalProps) {
  const [today] = useState(() => formatLocalDate(new Date()));
  const [followUpDate, setFollowUpDate] = useState(() => getFollowUpDate(currentFollowUpDate));
  const [followUpPurpose, setFollowUpPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const timeoutId = window.setTimeout(() => setFollowUpDate(getFollowUpDate(currentFollowUpDate)), 0);
    return () => window.clearTimeout(timeoutId);
  }, [currentFollowUpDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate || !followUpPurpose.trim()) {
      toast.error("Please provide a follow-up date and purpose.");
      return;
    }

    setSubmitting(true);
    const res = await scheduleCaseFollowUp(caseId, {
      nextFollowUpDate: followUpDate,
      followUpPurpose: followUpPurpose.trim(),
      notes: notes.trim() || undefined,
    });
    setSubmitting(false);

    if (res.success) {
      toast.success("Follow-up scheduled successfully!");
      setFollowUpPurpose("");
      setNotes("");
      onClose();
    } else {
      toast.error(res.error || "Failed to schedule follow-up");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <CalendarClock className="h-5 w-5 text-violet-600" /> Schedule Follow-up
          </DialogTitle>
          <DialogDescription className="text-xs">
            Set a reminder follow-up appointment for{" "}
            <strong className="text-foreground">{caseTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="followup-date" className="text-xs font-semibold">
              Follow-up Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="followup-date"
              type="date"
              value={followUpDate}
              min={today}
              onChange={(e) => setFollowUpDate(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="followup-purpose" className="text-xs font-semibold">
              Purpose / Agenda <span className="text-destructive">*</span>
            </Label>
            <Input
              id="followup-purpose"
              placeholder="e.g. Verify monthly assistance disbursement outcome"
              value={followUpPurpose}
              onChange={(e) => setFollowUpPurpose(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="followup-notes" className="text-xs font-semibold">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="followup-notes"
              placeholder="Any specific items to check or discuss during the follow-up..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs min-h-[80px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !followUpPurpose.trim()}
              className="text-xs gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scheduling...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Schedule Follow-up
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
