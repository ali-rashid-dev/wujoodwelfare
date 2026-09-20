"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Save, ArrowLeft, Heart, MapPin, Sparkles, Clock, FileText } from "lucide-react";
import { createVolunteer, updateVolunteer } from "@/app/(dashboard)/dashboard/volunteers/volunteer-actions";
import { VolunteerFormInput } from "@/validation/volunteer";

const SKILL_OPTIONS = [
  "Medical & First Aid",
  "Teaching & Education",
  "Logistics & Relief Distribution",
  "Driving & Transportation",
  "Counseling & Mental Health",
  "Event Management",
  "IT & Communications",
  "Cooking & Meal Prep",
  "Fundraising",
];

interface VolunteerFormProps {
  initialData?: {
    id: string;
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
    notes?: string | null;
  };
  isEditing?: boolean;
}

export function VolunteerForm({ initialData, isEditing = false }: VolunteerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<VolunteerFormInput>({
    name: initialData?.name || "",
    cnic: initialData?.cnic || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    status: (initialData?.status as any) || "APPLIED",
    skills: initialData?.skills || ["Logistics & Relief Distribution"],
    availability: (initialData?.availability as any) || "WEEKENDS",
    city: initialData?.city || "",
    district: initialData?.district || "",
    area: initialData?.area || "",
    address: initialData?.address || "",
    notes: initialData?.notes || "",
  });

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.skills.length === 0) {
      toast.error("Please select at least one skill");
      return;
    }
    setLoading(true);

    try {
      if (isEditing && initialData?.id) {
        const res = await updateVolunteer(initialData.id, formData);
        if (res.success) {
          toast.success("Volunteer updated successfully");
          router.push(`/dashboard/volunteers/${initialData.id}`);
        } else {
          toast.error(res.error || "Failed to update volunteer");
        }
      } else {
        const res = await createVolunteer(formData);
        if (res.success && res.id) {
          toast.success("Volunteer registered successfully");
          router.push(`/dashboard/volunteers/${res.id}`);
        } else {
          toast.error(res.error || "Failed to register volunteer");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-9 px-3"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEditing ? `Edit Volunteer Profile` : `Register New Volunteer`}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing ? "Update volunteer skills, availability, and contact information" : "Register a community volunteer for welfare campaigns and relief drives"}
            </p>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <span className="animate-spin text-sm">⏳</span>
          ) : isEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {isEditing ? "Save Changes" : "Register Volunteer"}
        </Button>
      </div>

      {/* Personal & Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Personal Details & Status
          </CardTitle>
          <CardDescription className="text-xs">
            Basic information and application status for the volunteer.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ayesha Malik"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              CNIC Number (Optional)
            </label>
            <Input
              value={formData.cnic || ""}
              onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
              placeholder="e.g. 42101-1234567-8"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Email Address <span className="text-destructive">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ayesha@example.com"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Phone Number <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+92 300 9876543"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Volunteer Status <span className="text-destructive">*</span>
            </label>
            <NativeSelect
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <NativeSelectOption value="APPLIED">Applied / Pending Interview</NativeSelectOption>
              <NativeSelectOption value="INTERVIEWED">Interviewed & Vetted</NativeSelectOption>
              <NativeSelectOption value="ACTIVE">Active Field Volunteer</NativeSelectOption>
              <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
              <NativeSelectOption value="REJECTED">Rejected</NativeSelectOption>
            </NativeSelect>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Availability <span className="text-destructive">*</span>
            </label>
            <NativeSelect
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
            >
              <NativeSelectOption value="WEEKENDS">Weekends Only</NativeSelectOption>
              <NativeSelectOption value="WEEKDAYS">Weekdays Only</NativeSelectOption>
              <NativeSelectOption value="EVENINGS">Evenings</NativeSelectOption>
              <NativeSelectOption value="FULL_TIME">Full Time</NativeSelectOption>
              <NativeSelectOption value="ON_CALL">On Call / Emergency</NativeSelectOption>
            </NativeSelect>
          </div>
        </CardContent>
      </Card>

      {/* Skills Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Volunteer Skills & Specializations
          </CardTitle>
          <CardDescription className="text-xs">
            Select one or more skills the volunteer can offer during welfare operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SKILL_OPTIONS.map((skill) => {
              const checked = formData.skills.includes(skill);
              return (
                <div
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? "border-primary/50 bg-primary/5 text-foreground font-medium"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => handleSkillToggle(skill)}
                  />
                  <span className="text-xs">{skill}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Location Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Location & Address
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">City</label>
            <Input
              value={formData.city || ""}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Lahore"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">District / Zone</label>
            <Input
              value={formData.district || ""}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder="e.g. Model Town"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Area / Neighborhood</label>
            <Input
              value={formData.area || ""}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="e.g. Block C"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Volunteer Notes & Background
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add background info, previous experience, or team remarks..."
          />
        </CardContent>
      </Card>
    </form>
  );
}
