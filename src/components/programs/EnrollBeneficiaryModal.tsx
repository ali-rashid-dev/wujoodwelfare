"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, UserPlus, CheckCircle2, UserCheck } from "lucide-react";
import { enrollBeneficiaryToProgram, getAvailableBeneficiariesForProgram } from "@/app/(dashboard)/dashboard/programs/program-actions";
import { toast } from "sonner";

interface EnrollBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programName: string;
}

interface BeneficiaryItem {
  id: string;
  name: string;
  cnic: string | null;
  phone: string | null;
  status: string;
}

export function EnrollBeneficiaryModal({
  isOpen,
  onClose,
  programId,
  programName,
}: EnrollBeneficiaryModalProps) {
  const [search, setSearch] = useState("");
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadBeneficiaries = useCallback(async (query: string) => {
    setLoading(true);
    const res = await getAvailableBeneficiariesForProgram({ search: query, limit: 15 });
    setBeneficiaries(res.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    if (isOpen) {
      getAvailableBeneficiariesForProgram({ search: "", limit: 15 }).then((res) => {
        if (isSubscribed) {
          setBeneficiaries(res.items);
        }
      });
    }
    return () => {
      isSubscribed = false;
    };
  }, [isOpen]);

  const handleClose = () => {
    setSearch("");
    setSelectedId(null);
    setNotes("");
    onClose();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    loadBeneficiaries(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      toast.error("Please select a beneficiary to enroll.");
      return;
    }

    setSubmitting(true);
    const res = await enrollBeneficiaryToProgram({
      programId,
      beneficiaryId: selectedId,
      notes,
    });
    setSubmitting(false);

    if (res.success) {
      toast.success("Beneficiary successfully enrolled in program!");
      handleClose();
    } else {
      toast.error(res.error || "Failed to enroll beneficiary");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <UserPlus className="h-5 w-5 text-primary" /> Enroll Beneficiary
          </DialogTitle>
          <DialogDescription className="text-xs">
            Enroll a registered beneficiary into <strong className="text-foreground">{programName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Search Beneficiary (Name, CNIC, Phone)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type name or CNIC..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Select Beneficiary</Label>
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-1 space-y-1 bg-muted/20">
              {loading ? (
                <div className="flex items-center justify-center p-6 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" /> Loading list...
                </div>
              ) : beneficiaries.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No beneficiaries found matching search query.
                </div>
              ) : (
                beneficiaries.map((b) => {
                  const isSelected = selectedId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedId(b.id)}
                      className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors text-xs ${
                        isSelected
                          ? "bg-primary/10 border border-primary/30 text-foreground"
                          : "hover:bg-accent text-muted-foreground"
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <span>{b.name}</span>
                          <Badge variant="outline" className="text-[10px] py-0 font-normal">
                            {b.status}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex gap-2">
                          {b.cnic && <span>CNIC: {b.cnic}</span>}
                          {b.phone && <span>Phone: {b.phone}</span>}
                        </div>
                      </div>

                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0 ml-2" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="enroll-notes" className="text-xs font-semibold">
              Enrollment Notes / Verification Remarks (Optional)
            </Label>
            <Textarea
              id="enroll-notes"
              placeholder="e.g. Verified eligibility criteria and CNIC copy submitted."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs min-h-[70px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !selectedId}
              className="text-xs gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Enrolling...
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5" /> Confirm Enrollment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
