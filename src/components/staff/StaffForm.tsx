"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, UserPlus, Save, ArrowLeft, Building2, UserCheck, PhoneCall, FileText } from "lucide-react";
import { createStaff, updateStaff } from "@/app/(dashboard)/dashboard/staff/staff-actions";
import { StaffFormInput } from "@/validation/staff";

const AVAILABLE_PERMISSIONS = [
  { id: "manage_beneficiaries", label: "Manage Beneficiaries", desc: "Create, view, and edit beneficiary records" },
  { id: "manage_households", label: "Manage Households", desc: "Assess and update household profiles" },
  { id: "approve_assistance", label: "Approve Assistance Grants", desc: "Authorize monetary or food aid disbursement" },
  { id: "manage_volunteers", label: "Manage Volunteers", desc: "Assign and log volunteer campaign activities" },
  { id: "view_reports", label: "View Analytics & Reports", desc: "Access high-level welfare operational metrics" },
  { id: "manage_staff", label: "Manage Staff & Permissions", desc: "Administrative access to staff profiles" },
];

interface StaffFormProps {
  initialData?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    designation: string;
    role: string;
    department: string;
    status: string;
    permissions: string[];
    emergencyContact?: string | null;
    notes?: string | null;
  };
  isEditing?: boolean;
}

export function StaffForm({ initialData, isEditing = false }: StaffFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<StaffFormInput>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    designation: initialData?.designation || "",
    role: (initialData?.role as any) || "FIELD_OFFICER",
    department: (initialData?.department as any) || "FIELD_OPERATIONS",
    status: (initialData?.status as any) || "ACTIVE",
    permissions: initialData?.permissions || ["manage_beneficiaries"],
    emergencyContact: initialData?.emergencyContact || "",
    notes: initialData?.notes || "",
  });

  const handlePermissionToggle = (permId: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && initialData?.id) {
        const res = await updateStaff(initialData.id, formData);
        if (res.success) {
          toast.success("Staff profile updated successfully");
          router.push(`/dashboard/staff/${initialData.id}`);
        } else {
          toast.error(res.error || "Failed to update staff member");
        }
      } else {
        const res = await createStaff(formData);
        if (res.success && res.id) {
          toast.success("Staff member created successfully");
          router.push(`/dashboard/staff/${res.id}`);
        } else {
          toast.error(res.error || "Failed to create staff member");
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
      {/* Header Bar */}
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
              {isEditing ? `Edit Staff Member` : `Onboard New Staff Member`}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing ? "Update employment details and security permissions" : "Register a staff member into the welfare management system"}
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
          {isEditing ? "Save Changes" : "Create Staff Profile"}
        </Button>
      </div>

      {/* Basic Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            Basic Profile Details
          </CardTitle>
          <CardDescription className="text-xs">
            Personal and contact information for the team member.
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
              placeholder="e.g. Tariq Mehmood"
              required
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
              placeholder="tariq@wujoodwelfare.org"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Phone Number
            </label>
            <Input
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+92 300 1234567"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Emergency Contact
            </label>
            <Input
              value={formData.emergencyContact || ""}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="Spouse/Parent Name & Phone (+92...)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employment & Department Role */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Role & Department Assignment
          </CardTitle>
          <CardDescription className="text-xs">
            Assign structural role, department, and employment status.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Designation / Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Senior Field Inspector"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Department <span className="text-destructive">*</span>
            </label>
            <NativeSelect
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
            >
              <NativeSelectOption value="FIELD_OPERATIONS">Field Operations</NativeSelectOption>
              <NativeSelectOption value="CASE_MANAGEMENT">Case Management</NativeSelectOption>
              <NativeSelectOption value="HEALTH_SERVICES">Health Services</NativeSelectOption>
              <NativeSelectOption value="EDUCATION">Education Relief</NativeSelectOption>
              <NativeSelectOption value="LOGISTICS_RELIEF">Logistics & Emergency</NativeSelectOption>
              <NativeSelectOption value="FINANCE_ADMIN">Finance & Admin</NativeSelectOption>
            </NativeSelect>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              System Role <span className="text-destructive">*</span>
            </label>
            <NativeSelect
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            >
              <NativeSelectOption value="FIELD_OFFICER">Field Officer</NativeSelectOption>
              <NativeSelectOption value="CASE_MANAGER">Case Manager</NativeSelectOption>
              <NativeSelectOption value="VOLUNTEER_COORDINATOR">Volunteer Coordinator</NativeSelectOption>
              <NativeSelectOption value="FINANCE_OFFICER">Finance Officer</NativeSelectOption>
              <NativeSelectOption value="ADMIN">System Administrator</NativeSelectOption>
            </NativeSelect>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Employment Status <span className="text-destructive">*</span>
            </label>
            <NativeSelect
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <NativeSelectOption value="ACTIVE">Active Duty</NativeSelectOption>
              <NativeSelectOption value="ON_LEAVE">On Leave</NativeSelectOption>
              <NativeSelectOption value="SUSPENDED">Suspended</NativeSelectOption>
              <NativeSelectOption value="TERMINATED">Terminated</NativeSelectOption>
            </NativeSelect>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Checkboxes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Access Permissions
          </CardTitle>
          <CardDescription className="text-xs">
            Select fine-grained permission flags granted to this staff profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_PERMISSIONS.map((perm) => {
              const checked = formData.permissions.includes(perm.id);
              return (
                <div
                  key={perm.id}
                  onClick={() => handlePermissionToggle(perm.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onClick={(event) => event.stopPropagation()}
                    onCheckedChange={() => handlePermissionToggle(perm.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-xs font-semibold text-foreground">{perm.label}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                      {perm.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Internal Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Administrative Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any internal onboarding notes or supervisor remarks..."
          />
        </CardContent>
      </Card>
    </form>
  );
}
