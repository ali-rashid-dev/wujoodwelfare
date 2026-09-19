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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Loader2, User, Briefcase, FileText } from "lucide-react";
import { createVerificationRecord } from "@/app/(dashboard)/dashboard/verification/verification-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NewVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: {
    beneficiaries: Array<{ id: string; name: string; cnic: string | null; phone: string | null; status: string }>;
    cases: Array<{ id: string; caseNumber: string | null; title: string; beneficiary: { name: string; cnic: string | null } }>;
    applications: Array<{ id: string; applicationCode: string; assistanceType: string; beneficiary: { name: string; cnic: string | null } }>;
    staff: Array<{ id: string; name: string; designation: string; department: string }>;
  };
}

export function NewVerificationModal({ isOpen, onClose, options }: NewVerificationModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [targetType, setTargetType] = useState<"BENEFICIARY" | "CASE" | "APPLICATION">("CASE");
  const [selectedId, setSelectedId] = useState("");
  const [verifierName, setVerifierName] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      toast.error("Please select a target beneficiary, case, or application");
      return;
    }

    setLoading(true);
    try {
      const res = await createVerificationRecord({
        beneficiaryId: targetType === "BENEFICIARY" ? selectedId : undefined,
        caseId: targetType === "CASE" ? selectedId : undefined,
        applicationId: targetType === "APPLICATION" ? selectedId : undefined,
        verifierName: verifierName || "Verification Officer",
        notes,
      });

      if (res.success && res.id) {
        toast.success(`Verification ${res.code} initiated successfully!`);
        onClose();
        router.push(`/dashboard/verification/${res.id}`);
      } else {
        toast.error(res.error || "Failed to start verification");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
            <ShieldCheck className="h-5 w-5" />
            <span>Identity & Eligibility Verification</span>
          </div>
          <DialogTitle className="text-xl font-bold">Initiate New Verification</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Launch identity checks, document verification, household inspection, and income assessment to eliminate duplicate or fraudulent claims.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Target Type selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Verify Target Entity</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={targetType === "CASE" ? "default" : "outline"}
                className="text-xs flex items-center justify-center gap-1.5 py-2 h-auto"
                onClick={() => {
                  setTargetType("CASE");
                  setSelectedId("");
                }}
              >
                <Briefcase className="h-3.5 w-3.5" />
                Case File
              </Button>
              <Button
                type="button"
                variant={targetType === "APPLICATION" ? "default" : "outline"}
                className="text-xs flex items-center justify-center gap-1.5 py-2 h-auto"
                onClick={() => {
                  setTargetType("APPLICATION");
                  setSelectedId("");
                }}
              >
                <FileText className="h-3.5 w-3.5" />
                Application
              </Button>
              <Button
                type="button"
                variant={targetType === "BENEFICIARY" ? "default" : "outline"}
                className="text-xs flex items-center justify-center gap-1.5 py-2 h-auto"
                onClick={() => {
                  setTargetType("BENEFICIARY");
                  setSelectedId("");
                }}
              >
                <User className="h-3.5 w-3.5" />
                Beneficiary
              </Button>
            </div>
          </div>

          {/* Item Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Select {targetType === "CASE" ? "Case File" : targetType === "APPLICATION" ? "Application" : "Beneficiary"}
            </Label>
            {targetType === "CASE" && (
              <Select value={selectedId} onValueChange={(val) => val && setSelectedId(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Choose a case..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {options.cases.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.caseNumber || c.id} — {c.title} ({c.beneficiary.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {targetType === "APPLICATION" && (
              <Select value={selectedId} onValueChange={(val) => val && setSelectedId(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Choose an application..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {options.applications.map((app) => (
                    <SelectItem key={app.id} value={app.id} className="text-xs">
                      {app.applicationCode} — {app.assistanceType} ({app.beneficiary.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {targetType === "BENEFICIARY" && (
              <Select value={selectedId} onValueChange={(val) => val && setSelectedId(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Choose a beneficiary..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {options.beneficiaries.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-xs">
                      {b.name} {b.cnic ? `(${b.cnic})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

          </div>

          {/* Assigned Verifier */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Assigned Verifier / Officer</Label>
            <Input
              value={verifierName}
              onChange={(e) => setVerifierName(e.target.value)}
              placeholder="e.g. Field Inspector Ahmed / Verification Unit"
              className="text-xs"
            />
          </div>

          {/* Initial Audit Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Initial Audit Context & Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for verification audit, fraud alert status, or key instructions..."
              className="text-xs min-h-[80px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-xs font-semibold gap-1.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Initiate Verification
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
