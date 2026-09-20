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
import { Truck, Loader2 } from "lucide-react";
import { createDistribution } from "@/app/(dashboard)/dashboard/distribution/distribution-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NewDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: {
    beneficiaries: Array<{ id: string; name: string; cnic: string | null; phone: string | null; status: string }>;
    cases: Array<{ id: string; caseNumber: string | null; title: string; beneficiary: { name: string; cnic: string | null } }>;
    programs: Array<{ id: string; code: string; name: string }>;
    centers: Array<{ id: string; code: string; name: string; city: string }>;
    assistanceRecords: Array<{ id: string; assistanceCode: string | null; type: string; quantity: string | null; beneficiary: { name: string; cnic: string | null } }>;
  };
}

const NO_SELECTION = "__NONE__";

export function NewDistributionModal({ isOpen, onClose, options }: NewDistributionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [assistanceRecordId, setAssistanceRecordId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [programId, setProgramId] = useState("");
  const [centerId, setCenterId] = useState("");
  const [itemsSummary, setItemsSummary] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);
  const [staffName, setStaffName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientCnic, setRecipientCnic] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiaryId) {
      toast.error("Please select a beneficiary");
      return;
    }
    if (!itemsSummary) {
      toast.error("Please provide an items summary description");
      return;
    }

    setLoading(true);
    try {
      const res = await createDistribution({
        assistanceRecordId: assistanceRecordId || undefined,
        beneficiaryId,
        caseId: caseId || undefined,
        programId: programId || undefined,
        centerId: centerId || undefined,
        itemsSummary,
        quantity,
        scheduledDate: scheduledDate || undefined,
        staffName: staffName || undefined,
        recipientName: recipientName || undefined,
        recipientCnic: recipientCnic || undefined,
      });

      if (res.success && res.id) {
        toast.success(`Distribution delivery ${res.code} created!`);
        onClose();
        router.push(`/dashboard/distribution/${res.id}`);
      } else {
        toast.error(res.error || "Failed to create distribution delivery");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
            <Truck className="h-5 w-5" />
            <span>Phase 4 — Physical Distribution Tracking</span>
          </div>
          <DialogTitle className="text-xl font-bold">Schedule Package Distribution</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Track physical delivery lifecycle: Approved &rarr; Scheduled &rarr; Distributed &rarr; Beneficiary Confirmation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Beneficiary Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Select Beneficiary *</Label>
            <Select value={beneficiaryId} onValueChange={(val) => val && setBeneficiaryId(val)}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Choose beneficiary..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {options.beneficiaries.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-xs">
                    {b.name} {b.cnic ? `(${b.cnic})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distribution Center */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Distribution Center / Warehouse</Label>
            <Select value={centerId || NO_SELECTION} onValueChange={(val) => setCenterId(val === NO_SELECTION ? "" : val || "")}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Choose warehouse / distribution center..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value={NO_SELECTION}>General Field Dispatch</SelectItem>
                {options.centers.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.name} ({c.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Summary & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Items & Package Contents *</Label>
              <Input
                value={itemsSummary}
                onChange={(e) => setItemsSummary(e.target.value)}
                placeholder="e.g. 50kg Flour, 1x Winter Ration Box, 2 Blankets"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Quantity</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setQuantity(Number.isFinite(value) && value >= 1 ? value : 1);
                }}
                className="text-xs"
              />
            </div>
          </div>

          {/* Linked Assistance Record */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Linked Assistance Record (Optional)</Label>
            <Select value={assistanceRecordId || NO_SELECTION} onValueChange={(val) => setAssistanceRecordId(val === NO_SELECTION ? "" : val || "")}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Link to recorded assistance..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value={NO_SELECTION}>No Direct Assistance Record</SelectItem>
                {options.assistanceRecords.map((ast) => (
                  <SelectItem key={ast.id} value={ast.id} className="text-xs">
                    {ast.assistanceCode || ast.id} — {ast.type} ({ast.beneficiary.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Staff */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Scheduled Delivery Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assigned Dispatch Officer</Label>
              <Input
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g. Field Officer Tariq"
                className="text-xs"
              />
            </div>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Recipient Name (If Proxy / Family Member)</Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Ali Hassan (Son)"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Recipient CNIC</Label>
              <Input
                value={recipientCnic}
                onChange={(e) => setRecipientCnic(e.target.value)}
                placeholder="35202-xxxxxxx-x"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-xs font-semibold gap-1.5 shadow-sm">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
              Schedule Delivery
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
