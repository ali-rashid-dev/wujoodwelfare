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
import { Gift, Loader2, DollarSign, Package, Stethoscope, GraduationCap, Shirt, Home, ShieldAlert, Wrench } from "lucide-react";
import { recordAssistance } from "@/app/(dashboard)/dashboard/assistance/assistance-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RecordAssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: {
    beneficiaries: Array<{ id: string; name: string; cnic: string | null; phone: string | null; status: string }>;
    cases: Array<{ id: string; caseNumber: string | null; title: string; beneficiary: { name: string; cnic: string | null } }>;
    programs: Array<{ id: string; code: string; name: string; assistanceType: string }>;
    staff: Array<{ id: string; name: string; designation: string; department: string }>;
  };
}

const ASSISTANCE_TYPES = [
  { value: "CASH", label: "Cash Assistance", icon: DollarSign, color: "text-blue-600" },
  { value: "FOOD", label: "Food & Ration Pack", icon: Package, color: "text-amber-600" },
  { value: "MEDICINE", label: "Medicine & Health Aid", icon: Stethoscope, color: "text-red-600" },
  { value: "EDUCATION", label: "Education / Scholarship", icon: GraduationCap, color: "text-emerald-600" },
  { value: "CLOTHING", label: "Clothing & Winter Pack", icon: Shirt, color: "text-indigo-600" },
  { value: "EQUIPMENT", label: "Equipment & Wheelchair", icon: Wrench, color: "text-cyan-600" },
  { value: "HOUSING", label: "Housing / Rent Aid", icon: Home, color: "text-orange-600" },
  { value: "EMERGENCY_PACKAGE", label: "Emergency Relief Package", icon: ShieldAlert, color: "text-purple-600" },
];

const NO_SELECTION = "__NONE__";

export function RecordAssistanceModal({ isOpen, onClose, options }: RecordAssistanceModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [programId, setProgramId] = useState("");
  const [type, setType] = useState("FOOD");
  const [amount, setAmount] = useState<number | "">(0);
  const [quantity, setQuantity] = useState("");
  const [distributionMethod, setDistributionMethod] = useState("DISTRIBUTION_CENTER");
  const [status, setStatus] = useState("DISBURSED");
  const [givenBy, setGivenBy] = useState("");
  const [givenAt, setGivenAt] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiaryId) {
      toast.error("Please select a beneficiary");
      return;
    }

    setLoading(true);
    try {
      const res = await recordAssistance({
        beneficiaryId,
        caseId: caseId || undefined,
        programId: programId || undefined,
        type: type as "CASH" | "FOOD" | "MEDICINE" | "EDUCATION" | "CLOTHING" | "EQUIPMENT" | "HOUSING" | "EMERGENCY_PACKAGE",
        amount: Number(amount) || 0,
        quantity: quantity || undefined,
        distributionMethod: distributionMethod as "BANK_TRANSFER" | "CASH_HANDOVER" | "DISTRIBUTION_CENTER" | "HOME_DELIVERY" | "PARTNER_VOUCHER" | "CHEQUE",
        status: status as "PENDING" | "APPROVED" | "DISBURSED" | "CANCELLED",
        givenBy: givenBy || undefined,
        givenAt,
        description: description || undefined,
        notes: notes || undefined,
      });

      if (res.success) {
        toast.success(`Assistance recorded under code ${res.code}!`);
        onClose();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to record assistance");
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
            <Gift className="h-5 w-5" />
            <span>Phase 4 — Assistance Management</span>
          </div>
          <DialogTitle className="text-xl font-bold">Record Provided Assistance</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Log exact aid disbursements (Cash, Food, Medicine, Education, Clothing, Equipment, Housing, Emergency Package) for full audit history.
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

          {/* Assistance Type selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Assistance Type *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ASSISTANCE_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 font-bold text-primary shadow-xs"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1 ${t.color}`} />
                    <span className="text-[10px] leading-tight">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Case & Program Linking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Linked Case File (Optional)</Label>
              <Select value={caseId || NO_SELECTION} onValueChange={(val) => setCaseId(val === NO_SELECTION ? "" : val || "")}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select case file..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value={NO_SELECTION}>No Case File</SelectItem>
                  {options.cases.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.caseNumber || c.id} — {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Linked Welfare Program (Optional)</Label>
              <Select value={programId || NO_SELECTION} onValueChange={(val) => setProgramId(val === NO_SELECTION ? "" : val || "")}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select program..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value={NO_SELECTION}>No Program Link</SelectItem>
                  {options.programs.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.code} — {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Financial Value (PKR)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 15000"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Items Quantity / Pack Details</Label>
              <Input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 1 Ration Pack / 2 Wheelchairs"
                className="text-xs"
              />
            </div>
          </div>

          {/* Method & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Disbursement Method</Label>
              <Select value={distributionMethod} onValueChange={(val) => val && setDistributionMethod(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISTRIBUTION_CENTER">Distribution Center</SelectItem>
                  <SelectItem value="CASH_HANDOVER">Direct Cash Handover</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Account Transfer</SelectItem>
                  <SelectItem value="HOME_DELIVERY">Field Home Delivery</SelectItem>
                  <SelectItem value="PARTNER_VOUCHER">Partner Voucher</SelectItem>
                  <SelectItem value="CHEQUE">Bank Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status</Label>
              <Select value={status} onValueChange={(val) => val && setStatus(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISBURSED">Disbursed & Handed Over</SelectItem>
                  <SelectItem value="APPROVED">Approved for Handover</SelectItem>
                  <SelectItem value="PENDING">Pending Approval</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Staff */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Disbursement Date</Label>
              <Input
                type="date"
                value={givenAt}
                onChange={(e) => setGivenAt(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Staff Member in Charge</Label>
              <Input
                value={givenBy}
                onChange={(e) => setGivenBy(e.target.value)}
                placeholder="e.g. Officer Ahmed"
                className="text-xs"
              />
            </div>
          </div>

          {/* Description & Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="assistance-description" className="text-xs font-semibold">Description</Label>
            <Input
              id="assistance-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the assistance provided"
              className="text-xs"
            />
            <Label htmlFor="assistance-notes" className="text-xs font-semibold">Audit Notes</Label>
            <Textarea
              id="assistance-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Package contents, bank reference #, or voucher details..."
              className="text-xs min-h-[70px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
              Record Assistance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
