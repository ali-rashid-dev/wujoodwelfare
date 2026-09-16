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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, HandHeart, Send } from "lucide-react";
import { disburseProgramAid } from "@/app/(dashboard)/dashboard/programs/program-actions";
import { toast } from "sonner";

interface DisburseAidModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programName: string;
  enrolledBeneficiaries: Array<{
    id: string;
    beneficiary: {
      id: string;
      name: string;
      cnic: string | null;
    };
  }>;
}

export function DisburseAidModal({
  isOpen,
  onClose,
  programId,
  programName,
  enrolledBeneficiaries,
}: DisburseAidModalProps) {
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiaryId) {
      toast.error("Please select an enrolled beneficiary.");
      return;
    }

    setSubmitting(true);
    const res = await disburseProgramAid({
      programId,
      beneficiaryId: selectedBeneficiaryId,
      amount: amount ? parseFloat(amount) : 0,
      quantity: quantity || undefined,
      description: description || undefined,
    });
    setSubmitting(false);

    if (res.success) {
      toast.success("Aid disbursement successfully recorded!");
      setAmount("");
      setQuantity("");
      setDescription("");
      setSelectedBeneficiaryId("");
      onClose();
    } else {
      toast.error(res.error || "Failed to disburse aid");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <HandHeart className="h-5 w-5 text-emerald-600" /> Disburse Program Aid
          </DialogTitle>
          <DialogDescription className="text-xs">
            Log financial or item aid distribution under <strong className="text-foreground">{programName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Enrolled Beneficiary</Label>
            {enrolledBeneficiaries.length === 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-md border border-amber-200 dark:border-amber-900">
                No beneficiaries are currently enrolled in this program. Please enroll a beneficiary first.
              </p>
            ) : (
              <Select value={selectedBeneficiaryId} onValueChange={(val) => setSelectedBeneficiaryId(val || "")}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select enrolled beneficiary..." />
                </SelectTrigger>
                <SelectContent>
                  {enrolledBeneficiaries.map((e) => (
                    <SelectItem key={e.beneficiary.id} value={e.beneficiary.id} className="text-xs">
                      {e.beneficiary.name} {e.beneficiary.cnic ? `(CNIC: ${e.beneficiary.cnic})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="disburse-amount" className="text-xs font-semibold">
                Financial Amount (PKR)
              </Label>
              <Input
                id="disburse-amount"
                type="number"
                placeholder="e.g. 15000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="disburse-qty" className="text-xs font-semibold">
                Item Quantity / Package (Optional)
              </Label>
              <Input
                id="disburse-qty"
                type="text"
                placeholder="e.g. 1 Ration Pack (30kg)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="disburse-desc" className="text-xs font-semibold">
              Disbursement Details / Description
            </Label>
            <Textarea
              id="disburse-desc"
              placeholder="e.g. Disbursed monthly dry ration package and PKR 5,000 cash grant."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              disabled={submitting || !selectedBeneficiaryId || enrolledBeneficiaries.length === 0}
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Recording...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Confirm Disbursement
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
