"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Home,
  User,
  FileText,
  Briefcase,
  Gift,
  Loader2,
  Calendar,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Camera,
  FileCheck,
  ChevronRight,
  BookOpen,
} from "lucide-react";

import { updateDistributionStatus } from "@/app/(dashboard)/dashboard/distribution/distribution-actions";
import { toast } from "sonner";

interface DistributionProfileProps {
  record: {
    id: string;
    distributionCode: string;
    assistanceRecordId: string | null;
    beneficiaryId: string;
    caseId: string | null;
    programId: string | null;
    centerId: string | null;
    centerName: string | null;

    itemsSummary: string;
    quantity: number;
    status: string;

    scheduledDate: string | null;
    distributedAt: string | null;
    confirmedAt: string | null;

    staffName: string | null;
    recipientName: string | null;
    recipientCnic: string | null;
    proofPhotoUrl: string | null;
    receiptNumber: string | null;
    confirmationNotes: string | null;

    createdAt: string;
    updatedAt: string;

    beneficiary: {
      id: string;
      name: string;
      cnic: string | null;
      phone: string | null;
      status: string;
      registeredAt: string;
      address: { street: string | null; area: string | null; city: string | null; district: string | null; province: string | null } | null;
      family: { totalChildren: number; dependents: number } | null;
    } | null;

    caseItem: { id: string; caseNumber: string | null; title: string; status: string } | null;
    program: { id: string; code: string; name: string } | null;
    center: { id: string; code: string; name: string; city: string; address: string; inChargeName: string | null; phone: string | null } | null;
    assistanceRecord: { id: string; assistanceCode: string | null; type: string; amount: unknown; quantity: string | null } | null;

    logs: Array<{
      id: string;
      action: string;
      fromStatus: string | null;
      toStatus: string;
      performedBy: string;
      notes: string | null;
      timestamp: string;
    }>;
  };
}

const WORKFLOW_STEPS = [
  { status: "APPROVED", label: "1. Approved", desc: "Order approved for packing" },
  { status: "SCHEDULED", label: "2. Scheduled", desc: "Dispatch scheduled from warehouse" },
  { status: "DISTRIBUTED", label: "3. Out for Delivery", desc: "Field officer package handover" },
  { status: "BENEFICIARY_CONFIRMED", label: "4. Beneficiary Confirmed", desc: "Recipient CNIC & proof verified" },
];

export function DistributionProfile({ record }: DistributionProfileProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<"APPROVED" | "SCHEDULED" | "DISTRIBUTED" | "BENEFICIARY_CONFIRMED" | "FAILED_DELIVERY">("SCHEDULED");

  const [recipientName, setRecipientName] = useState(record.recipientName || record.beneficiary?.name || "");
  const [recipientCnic, setRecipientCnic] = useState(record.recipientCnic || record.beneficiary?.cnic || "");
  const [receiptNumber, setReceiptNumber] = useState(record.receiptNumber || `RCPT-${record.distributionCode}`);
  const [proofPhotoUrl, setProofPhotoUrl] = useState(record.proofPhotoUrl || "");
  const [confirmationNotes, setConfirmationNotes] = useState(record.confirmationNotes || "");

  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.status === record.status);

  const handleAdvanceStatus = async () => {
    setLoading(true);
    try {
      const res = await updateDistributionStatus(record.id, {
        targetStatus,
        recipientName: recipientName || undefined,
        recipientCnic: recipientCnic || undefined,
        receiptNumber: receiptNumber || undefined,
        proofPhotoUrl: proofPhotoUrl || undefined,
        confirmationNotes: confirmationNotes || undefined,
      });

      if (res.success) {
        toast.success(`Delivery status updated to ${targetStatus}`);
        setStatusModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update delivery status");
      }
    } catch {
      toast.error("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background p-4 rounded-xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/distribution")} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground font-bold">{record.distributionCode}</span>
              <Badge variant="outline" className={`font-semibold text-xs ${
                record.status === "BENEFICIARY_CONFIRMED" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                record.status === "FAILED_DELIVERY" ? "bg-red-100 text-red-800 border-red-300" :
                "bg-purple-100 text-purple-800 border-purple-300"
              }`}>
                {record.status.replace("_", " ")}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-foreground mt-0.5">
              {record.itemsSummary} (Qty: {record.quantity})
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {record.status !== "BENEFICIARY_CONFIRMED" && (
            <Button
              size="sm"
              onClick={() => {
                if (record.status === "APPROVED") setTargetStatus("SCHEDULED");
                else if (record.status === "SCHEDULED") setTargetStatus("DISTRIBUTED");
                else if (record.status === "DISTRIBUTED") setTargetStatus("BENEFICIARY_CONFIRMED");
                setStatusModalOpen(true);
              }}
              className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Advance Delivery Status
            </Button>
          )}
        </div>
      </div>

      {/* 4-Step Visual Workflow Progress Bar */}
      <Card className="p-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Physical Distribution Lifecycle Stepper
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {WORKFLOW_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={step.status}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? "border-primary bg-primary/5 shadow-xs"
                    : isCompleted
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-border/50 opacity-60 bg-muted/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Step 0{index + 1}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <h4 className="font-bold text-xs text-foreground">{step.label}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Beneficiary & Recipient Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Recipient & Beneficiary Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                <div>
                  <span className="text-muted-foreground font-semibold">Primary Beneficiary Name</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{record.beneficiary?.name || "N/A"}</p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">CNIC: {record.beneficiary?.cnic || "No CNIC"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Contact Phone & Address</span>
                  <p className="font-bold text-foreground mt-0.5">{record.beneficiary?.phone || "No Phone"}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {record.beneficiary?.address?.street ? `${record.beneficiary.address.street}, ${record.beneficiary.address.area}, ${record.beneficiary.address.city}` : "Address on file"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-muted-foreground font-semibold">Package Recipient Name</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{record.recipientName || record.beneficiary?.name || "Self"}</p>
                </div>

                <div>
                  <span className="text-muted-foreground font-semibold">Recipient Verified CNIC</span>
                  <p className="text-sm font-mono font-bold text-foreground mt-0.5">{record.recipientCnic || record.beneficiary?.cnic || "Not Recorded"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proof of Delivery Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Delivery Confirmation & Proof Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-muted-foreground font-semibold">Digital Receipt #</span>
                  <p className="text-sm font-mono font-bold text-foreground mt-0.5">{record.receiptNumber || "Pending Receipt"}</p>
                </div>

                <div>
                  <span className="text-muted-foreground font-semibold">Confirmation Timestamp</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {record.confirmedAt ? new Date(record.confirmedAt).toLocaleString() : "Unconfirmed"}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground font-semibold">Assigned Dispatch Officer</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{record.staffName || "Field Officer"}</p>
                </div>
              </div>

              {record.proofPhotoUrl && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-muted-foreground font-semibold">Proof of Delivery Photo</span>
                  <div className="p-3 border rounded-lg bg-muted/20 font-mono text-xs text-primary truncate">
                    Photo URL: {record.proofPhotoUrl}
                  </div>
                </div>
              )}

              {record.confirmationNotes && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-muted-foreground font-semibold">Delivery Confirmation Notes</span>
                  <p className="p-3 rounded-lg border border-border/60 bg-background text-xs">
                    {record.confirmationNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Distribution Center Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                Warehouse & Distribution Center
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground font-semibold">Center Name</span>
                <p className="font-bold text-foreground mt-0.5">{record.centerName || record.center?.name || "Field Dispatch Station"}</p>
              </div>
              {record.center && (
                <>
                  <div>
                    <span className="text-muted-foreground font-semibold">Center Code & City</span>
                    <p className="font-mono text-foreground mt-0.5">{record.center.code} ({record.center.city})</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-semibold">Address</span>
                    <p className="text-foreground mt-0.5">{record.center.address}</p>
                  </div>
                  {record.center.inChargeName && (
                    <div>
                      <span className="text-muted-foreground font-semibold">In-Charge Manager</span>
                      <p className="text-foreground mt-0.5">{record.center.inChargeName} ({record.center.phone || "No Phone"})</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Context Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Linked Modules & Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {record.caseItem && (
                <Link href={`/dashboard/cases/${record.caseItem.id}`} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-semibold">{record.caseItem.caseNumber || "Case"}</div>
                      <div className="text-[11px] text-muted-foreground">{record.caseItem.title}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )}

              {record.program && (
                <Link href={`/dashboard/programs/${record.program.id}`} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold">{record.program.code}</div>
                      <div className="text-[11px] text-muted-foreground">{record.program.name}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )}

              {record.assistanceRecord && (
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-emerald-50/50">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold">{record.assistanceRecord.assistanceCode || "Assistance"}</div>
                      <div className="text-[11px] text-muted-foreground">Type: {record.assistanceRecord.type}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Timeline Logs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Delivery Audit Trail ({record.logs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs max-h-60 overflow-y-auto">
              {record.logs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg border border-border/50 bg-background">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{log.action}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    By {log.performedBy} {log.notes ? `— ${log.notes}` : ""}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advance Status Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
              <Truck className="h-5 w-5" />
              <span>Package Delivery State Transition</span>
            </div>
            <DialogTitle className="text-xl font-bold">Advance Delivery Workflow</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update delivery status and record recipient CNIC verification & proof of delivery.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {WORKFLOW_STEPS.map((step) => (
                  <Button
                    key={step.status}
                    type="button"
                    variant={targetStatus === step.status ? "default" : "outline"}
                    className="text-xs justify-start py-2 h-auto"
                    onClick={() => setTargetStatus(step.status as typeof targetStatus)}
                  >
                    {step.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Recipient Name</Label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient full name"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Digital Receipt / Voucher #</Label>
                <Input
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="RCPT-2026-XXXX"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Proof Photo URL (Optional)</Label>
                <Input
                  value={proofPhotoUrl}
                  onChange={(e) => setProofPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Delivery Confirmation Notes</Label>
              <Textarea
                value={confirmationNotes}
                onChange={(e) => setConfirmationNotes(e.target.value)}
                placeholder="Notes on package handover, recipient signature, or field inspector comments..."
                className="text-xs min-h-[70px]"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setStatusModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button onClick={handleAdvanceStatus} disabled={loading} className="text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save Delivery Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
