"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Target, Plus, MapPin, Calendar, Users, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { createCampaign } from "@/app/(dashboard)/dashboard/volunteers/volunteer-actions";

export interface CampaignItem {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
  targetBeneficiaries?: number | null;
  _count?: {
    volunteerAssignments: number;
  };
}

interface CampaignsManagerProps {
  campaigns: CampaignItem[];
}

export function CampaignsManager({ campaigns }: CampaignsManagerProps) {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetBeneficiaries, setTargetBeneficiaries] = useState<number | "">("");
  const [status, setStatus] = useState("PLANNING");

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate) {
      toast.error("Please fill in required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await createCampaign({
        title,
        description,
        location,
        startDate,
        endDate,
        targetBeneficiaries: targetBeneficiaries === "" ? undefined : Number(targetBeneficiaries),
        status: status as any,
      });

      if (res.success) {
        toast.success("Welfare campaign created successfully");
        setOpenModal(false);
        setTitle("");
        setDescription("");
        setLocation("");
        setStartDate("");
        setEndDate("");
        setTargetBeneficiaries("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create campaign");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Active Campaign</Badge>;
      case "PLANNING":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Planning</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">Completed</Badge>;
      case "ON_HOLD":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">On Hold</Badge>;
      default:
        return <Badge variant="outline">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/volunteers")}
            className="h-9 px-3"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Volunteers
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Welfare Campaigns & Relief Drives
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Organize campaigns, assign volunteers, and monitor ground welfare operations.
            </p>
          </div>
        </div>

        <Button size="sm" onClick={() => setOpenModal(true)} className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          Create New Campaign
        </Button>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground">
          No welfare campaigns registered yet. Click "Create New Campaign" to launch a campaign drive.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((cmp) => (
            <Card key={cmp.id} className="shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold">{cmp.title}</CardTitle>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {cmp.code}
                      </Badge>
                    </div>
                    {cmp.description && (
                      <CardDescription className="text-xs mt-1 line-clamp-2">
                        {cmp.description}
                      </CardDescription>
                    )}
                  </div>
                  {getStatusBadge(cmp.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs text-muted-foreground border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {cmp.location || "Multiple Cities / Nationwide"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(cmp.startDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-foreground">
                      {cmp._count?.volunteerAssignments || 0} Volunteers Assigned
                    </span>
                  </div>

                  {cmp.targetBeneficiaries && (
                    <span className="text-[11px] text-muted-foreground">
                      Target: <strong className="text-foreground">{cmp.targetBeneficiaries}</strong> families
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Create Welfare Campaign</DialogTitle>
              <DialogDescription className="text-xs">
                Setup a campaign for volunteer deployment (e.g. Ramadan Ration Drive, Flood Relief).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-medium block mb-1">Campaign Title <span className="text-destructive">*</span></label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ramadan Ration Box Drive 2026"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Location / Zone</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lahore & South Punjab"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1">Start Date <span className="text-destructive">*</span></label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Target Beneficiary Families</label>
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  value={targetBeneficiaries}
                  onChange={(e) => setTargetBeneficiaries(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Status</label>
                <NativeSelect
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <NativeSelectOption value="PLANNING">Planning Phase</NativeSelectOption>
                  <NativeSelectOption value="ACTIVE">Active Campaign</NativeSelectOption>
                  <NativeSelectOption value="COMPLETED">Completed</NativeSelectOption>
                  <NativeSelectOption value="ON_HOLD">On Hold</NativeSelectOption>
                </NativeSelect>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Description / Objectives</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe food distribution, medical assistance, etc..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? "Creating..." : "Create Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
