"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Heart,
  Sparkles,
  Clock,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Plus,
  ArrowLeft,
  Target,
  History,
  CheckCircle2,
  FileText,
  Star,
} from "lucide-react";
import { assignVolunteerToCampaign, logVolunteerActivity } from "@/app/(dashboard)/dashboard/volunteers/volunteer-actions";
import { VolunteerForm } from "./VolunteerForm";

interface CampaignAssignment {
  id: string;
  role?: string | null;
  assignedAt: string;
  hoursLogged: number;
  status: string;
  campaign: {
    id: string;
    code: string;
    title: string;
    location?: string | null;
    status: string;
    startDate: string;
    endDate?: string | null;
  };
}

interface VolunteerActivity {
  id: string;
  title: string;
  description?: string | null;
  hours: number;
  activityDate: string;
  location?: string | null;
  feedback?: string | null;
}

interface VolunteerProfileProps {
  volunteer: {
    id: string;
    volunteerCode: string;
    name: string;
    cnic?: string | null;
    email: string;
    phone: string;
    status: string;
    skills: string[];
    availability: string;
    city?: string | null;
    district?: string | null;
    area?: string | null;
    address?: string | null;
    totalHoursLogged: number;
    rating?: number | null;
    joinedAt: string;
    notes?: string | null;
    campaignAssignments: CampaignAssignment[];
    activities: VolunteerActivity[];
  };
  availableCampaigns: { id: string; title: string; code: string; location?: string | null }[];
}

export function VolunteerProfile({ volunteer, availableCampaigns }: VolunteerProfileProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("campaigns");

  // Assign Campaign Modal State
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [assignmentRole, setAssignmentRole] = useState("Field Volunteer");
  const [submittingCampaign, setSubmittingCampaign] = useState(false);

  // Log Hours Dialog State
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [logTitle, setLogTitle] = useState("");
  const [logDesc, setLogDesc] = useState("");
  const [logHours, setLogHours] = useState<number>(4);
  const [logLocation, setLogLocation] = useState(volunteer.city || "");
  const [logFeedback, setLogFeedback] = useState("");
  const [submittingLog, setSubmittingLog] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const handleAssignCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) {
      toast.error("Please select a campaign");
      return;
    }
    setSubmittingCampaign(true);
    try {
      const res = await assignVolunteerToCampaign(volunteer.id, {
        campaignId: selectedCampaignId,
        role: assignmentRole,
        hoursLogged: 0,
        status: "ASSIGNED",
      });
      if (res.success) {
        toast.success("Volunteer assigned to campaign successfully");
        setAssignDialogOpen(false);
        setSelectedCampaignId("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to assign campaign");
      }
    } catch {
      toast.error("Failed to assign campaign");
    } finally {
      setSubmittingCampaign(false);
    }
  };

  const handleLogActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim()) {
      toast.error("Please enter activity title");
      return;
    }
    setSubmittingLog(true);
    try {
      const res = await logVolunteerActivity(volunteer.id, {
        title: logTitle,
        description: logDesc,
        hours: logHours,
        location: logLocation,
        feedback: logFeedback,
      });
      if (res.success) {
        toast.success("Volunteer hours logged successfully");
        setLogDialogOpen(false);
        setLogTitle("");
        setLogDesc("");
        setLogFeedback("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to log activity");
      }
    } catch {
      toast.error("Failed to log activity");
    } finally {
      setSubmittingLog(false);
    }
  };

  if (isEditing) {
    return (
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(false)}
          className="mb-4 text-xs gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cancel Editing
        </Button>
        <VolunteerForm initialData={volunteer} isEditing={true} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/volunteers")}
          className="h-9 text-xs gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Volunteer Directory
        </Button>

        <Button
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-9 text-xs gap-1.5"
        >
          Edit Profile
        </Button>
      </div>

      {/* Volunteer Overview Banner */}
      <Card className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl shadow-inner">
                <Heart className="h-8 w-8 fill-current text-emerald-400" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">{volunteer.name}</h1>
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono text-xs">
                    {volunteer.volunteerCode}
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    {volunteer.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium text-white">
                    <Clock className="h-3.5 w-3.5 text-emerald-400" />
                    Availability: {volunteer.availability}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {volunteer.city || "Pakistan"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {volunteer.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {volunteer.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 text-xs">
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <Clock className="h-4 w-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block leading-tight">Total Hours Logged</span>
                  <span className="font-bold text-sm text-emerald-300">{volunteer.totalHoursLogged} hrs</span>
                </div>
              </div>

              {volunteer.cnic && (
                <span className="text-[11px] text-slate-400 font-mono">
                  CNIC: {volunteer.cnic}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Badges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Volunteer Skills & Specializations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          {volunteer.skills.map((skill) => (
            <Badge key={skill} className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1 text-primary" />
              {skill}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b pb-2">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="campaigns" className="text-xs gap-2">
              <Target className="h-3.5 w-3.5" />
              Campaign Assignments ({volunteer.campaignAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="activities" className="text-xs gap-2">
              <History className="h-3.5 w-3.5" />
              Logged Hours & Activity ({volunteer.activities.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === "campaigns" && (
            <Button
              size="sm"
              onClick={() => setAssignDialogOpen(true)}
              className="h-8 text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Assign Campaign
            </Button>
          )}

          {activeTab === "activities" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLogDialogOpen(true)}
              className="h-8 text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Volunteer Hours
            </Button>
          )}
        </div>

        {/* Tab 1: Campaign Assignments */}
        <TabsContent value="campaigns" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {volunteer.campaignAssignments.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No campaign assignments found for this volunteer yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {volunteer.campaignAssignments.map((ca) => (
                    <div key={ca.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground">
                            {ca.campaign.title}
                          </span>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {ca.campaign.code}
                          </Badge>
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[10px]">
                            {ca.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>Role: <strong className="text-foreground">{ca.role || "Volunteer"}</strong></span>
                          {ca.campaign.location && <span>• Location: {ca.campaign.location}</span>}
                          <span>• Hours: {ca.hoursLogged} hrs</span>
                        </div>
                      </div>

                      <div className="text-right text-xs text-muted-foreground">
                        <div>Assigned: {new Date(ca.assignedAt).toLocaleDateString()}</div>
                        <span className="text-[11px] text-primary">
                          Start Date: {new Date(ca.campaign.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Logged Hours & Activity */}
        <TabsContent value="activities" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {volunteer.activities.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No volunteer activity logged yet.
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-emerald-500/30 space-y-6">
                  {volunteer.activities.map((act) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{act.title}</span>
                            <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 text-[10px]">
                              +{act.hours} Hours
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(act.activityDate).toLocaleDateString()}
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-xs text-muted-foreground">{act.description}</p>
                        )}
                        {act.feedback && (
                          <p className="text-[11px] text-amber-600 font-medium italic">
                            Feedback: "{act.feedback}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Campaign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAssignCampaignSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Assign to Welfare Campaign</DialogTitle>
              <DialogDescription className="text-xs">
                Select a welfare campaign to deploy {volunteer.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-medium block mb-1">Select Campaign</label>
                <NativeSelect
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  required
                >
                  <NativeSelectOption value="">-- Select Campaign --</NativeSelectOption>
                  {availableCampaigns.map((c) => (
                    <NativeSelectOption key={c.id} value={c.id}>
                      {c.title} ({c.code})
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Assigned Role</label>
                <Input
                  value={assignmentRole}
                  onChange={(e) => setAssignmentRole(e.target.value)}
                  placeholder="e.g. Relief Distribution Lead, Registration Desk"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submittingCampaign}>
                {submittingCampaign ? "Assigning..." : "Assign Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Activity & Hours Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleLogActivitySubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Log Volunteer Service Hours</DialogTitle>
              <DialogDescription className="text-xs">
                Log volunteer service hours and performance remarks for {volunteer.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-medium block mb-1">Activity Title</label>
                <Input
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  placeholder="e.g. Ramadan Ration Box Packing & Distribution"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Hours Logged</label>
                <Input
                  type="number"
                  min={1}
                  value={logHours}
                  onChange={(e) => setLogHours(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Location</label>
                <Input
                  value={logLocation}
                  onChange={(e) => setLogLocation(e.target.value)}
                  placeholder="e.g. Lahore Community Center"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Description & Tasks Completed</label>
                <Input
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  placeholder="Distributed 150 ration packs to registered families"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Supervisor Feedback / Rating Remarks</label>
                <Input
                  value={logFeedback}
                  onChange={(e) => setLogFeedback(e.target.value)}
                  placeholder="Punctual, energetic, and highly supportive"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setLogDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submittingLog}>
                {submittingLog ? "Saving..." : "Log Hours"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
