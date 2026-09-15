"use client";

import React, { useRef, useState, useTransition } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Users,
  Plus,
  Trash2,
  Save,
  Loader2,
  ArrowLeft,
  DollarSign,
  HeartHandshake,
  AlertCircle,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { createHousehold, getBeneficiaryOptions } from "@/app/(dashboard)/dashboard/households/households";
import { HouseholdFormInput, HouseholdMemberInput } from "@/validation/household";

interface BeneficiaryOption {
  id: string;
  name: string;
  cnic?: string | null;
}

interface HouseholdFormProps {
  initialBeneficiaries?: BeneficiaryOption[];
  initialTotalPages?: number;
}

export function HouseholdForm({ initialBeneficiaries = [], initialTotalPages = 1 }: HouseholdFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isBeneficiaryPending, startBeneficiaryTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  // Form State
  const [name, setName] = useState("");
  const [headBeneficiaryId, setHeadBeneficiaryId] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("0");
  const [housingType, setHousingType] = useState("RENTED");
  const [housingCondition, setHousingCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [beneficiarySearch, setBeneficiarySearch] = useState("");
  const [beneficiaryPage, setBeneficiaryPage] = useState(1);
  const [beneficiaryTotalPages, setBeneficiaryTotalPages] = useState(initialTotalPages);
  const [beneficiaryOptions, setBeneficiaryOptions] = useState(initialBeneficiaries);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryOption | null>(null);
  const autoFilledHeadRef = useRef<{ fullName?: string; cnic?: string } | null>(null);

  // Family Members State
  const [members, setMembers] = useState<HouseholdMemberInput[]>([
    {
      fullName: "",
      relationToHead: "HEAD",
      age: 35,
      gender: "MALE",
      employmentStatus: "DAILY_WAGE",
      monthlyIncome: 0,
      isDisable: false,
      isElderly: false,
      isDependent: false,
    },
  ]);

  const addMember = (defaultRelation: string = "SON") => {
    setMembers((prev) => [
      ...prev,
      {
        fullName: "",
        relationToHead: defaultRelation as any,
        age: defaultRelation === "SON" || defaultRelation === "DAUGHTER" ? 8 : 25,
        gender: defaultRelation === "SON" || defaultRelation === "FATHER" ? "MALE" : "FEMALE",
        employmentStatus: defaultRelation === "SON" || defaultRelation === "DAUGHTER" ? "STUDENT" : "UNEMPLOYED",
        monthlyIncome: 0,
        isDisable: false,
        isElderly: defaultRelation === "FATHER" || defaultRelation === "MOTHER" || defaultRelation === "GRANDPARENT",
        isDependent: true,
      },
    ]);
  };

  const updateMember = (index: number, field: keyof HouseholdMemberInput, value: any) => {
    if (index === 0 && (field === "fullName" || field === "cnic")) {
      autoFilledHeadRef.current = {
        ...autoFilledHeadRef.current,
        [field]: undefined,
      };
    }
    setMembers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const loadBeneficiaries = (search: string, page: number) => {
    startBeneficiaryTransition(async () => {
      const result = await getBeneficiaryOptions({ search, page, limit: 25 });
      setBeneficiaryOptions(result.items);
      setBeneficiaryPage(result.page);
      setBeneficiaryTotalPages(result.totalPages);
    });
  };

  const removeMember = (index: number) => {
    if (members.length <= 1) {
      toast.error("Household must have at least one member (Head).");
      return;
    }
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleHeadChange = (id: string) => {
    setHeadBeneficiaryId(id);
    const found = beneficiaryOptions.find((b) => b.id === id) || (selectedBeneficiary?.id === id ? selectedBeneficiary : null);
    if (found && !name) {
      setName(`${found.name} Family Household`);
    }
    if (members.length > 0) {
      const currentHead = members[0];
      const previousAutoFill = autoFilledHeadRef.current;
      const canReplaceName = !currentHead.fullName || currentHead.fullName === previousAutoFill?.fullName;
      const canReplaceCnic = !currentHead.cnic || currentHead.cnic === previousAutoFill?.cnic;

      if (canReplaceName || canReplaceCnic) {
        setMembers((prev) => {
          const copy = [...prev];
          copy[0] = {
            ...copy[0],
            ...(canReplaceName ? { fullName: found?.name || "" } : {}),
            ...(canReplaceCnic ? { cnic: found?.cnic || "" } : {}),
          };
          return copy;
        });
        autoFilledHeadRef.current = found ? { fullName: found.name, cnic: found.cnic || undefined } : null;
      }
    }
    setSelectedBeneficiary(found || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Household name is required");
      setActiveTab("basic");
      return;
    }

    const invalidMember = members.find((m) => !m.fullName.trim());
    if (invalidMember) {
      setErrorMsg("All family members must have a full name");
      setActiveTab("members");
      return;
    }

    const payload: HouseholdFormInput = {
      name,
      headBeneficiaryId,
      monthlyIncome: Number(monthlyIncome) || 0,
      housingType: housingType as any,
      housingCondition,
      notes,
      members,
    };

    startTransition(async () => {
      const res = await createHousehold(payload);
      if (res.success) {
        toast.success("Household created successfully!");
        window.location.href = `/dashboard/households/${res.id}`;
      } else {
        setErrorMsg(res.error || "Failed to create household");
      }
    });
  };

  const totalCalculatedIncome = (Number(monthlyIncome) || 0) + members.reduce((sum, m) => sum + (Number(m.monthlyIncome) || 0), 0);
  const totalMembersCount = members.length;
  const perCapitaIncome = totalMembersCount > 0 ? Math.round(totalCalculatedIncome / totalMembersCount) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/households"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Households
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1 flex items-center gap-2">
            <Home className="w-6 h-6 text-primary" /> Create New Household
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Register family unit, assign household head, and record dependents for welfare assessment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={isPending}
            className="text-xs font-semibold gap-1.5 h-10 px-5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save & Assess Household
              </>
            )}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Tabs */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="basic" className="gap-1.5 text-xs">
                <Home className="w-3.5 h-3.5" /> 1. Household Info
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5" /> 2. Family Members ({members.length})
              </TabsTrigger>
              <TabsTrigger value="assessment" className="gap-1.5 text-xs">
                <HeartHandshake className="w-3.5 h-3.5" /> 3. Economic & Assessment
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: BASIC HOUSEHOLD INFO */}
            <TabsContent value="basic" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="headSelect" className="text-xs font-semibold">
                    Select Household Head (Registered Beneficiary)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={beneficiarySearch}
                      onChange={(e) => setBeneficiarySearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          loadBeneficiaries(beneficiarySearch, 1);
                        }
                      }}
                      placeholder="Search name or CNIC"
                      className="text-xs"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => loadBeneficiaries(beneficiarySearch, 1)} disabled={isBeneficiaryPending}>
                      Search
                    </Button>
                  </div>
                  <NativeSelect
                    id="headSelect"
                    value={headBeneficiaryId}
                    onChange={(e) => handleHeadChange(e.target.value)}
                    className="w-full"
                  >
                    <NativeSelectOption value="">-- Optional: Select Head Beneficiary --</NativeSelectOption>
                    {(selectedBeneficiary && !beneficiaryOptions.some((b) => b.id === selectedBeneficiary.id)
                      ? [selectedBeneficiary, ...beneficiaryOptions]
                      : beneficiaryOptions
                    ).map((b) => (
                      <NativeSelectOption key={b.id} value={b.id}>
                        {b.name} {b.cnic ? `(CNIC: ${b.cnic})` : ""}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <Button type="button" variant="ghost" size="sm" disabled={isBeneficiaryPending || beneficiaryPage <= 1} onClick={() => loadBeneficiaries(beneficiarySearch, beneficiaryPage - 1)}>
                      Previous
                    </Button>
                    <span>Page {beneficiaryPage} of {beneficiaryTotalPages}</span>
                    <Button type="button" variant="ghost" size="sm" disabled={isBeneficiaryPending || beneficiaryPage >= beneficiaryTotalPages} onClick={() => loadBeneficiaries(beneficiarySearch, beneficiaryPage + 1)}>
                      Next
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Assigning a head links this family directly to an existing beneficiary profile.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold">
                    Household Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    required
                    placeholder="e.g. Muhammad Ali Khan Household"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="housingType" className="text-xs font-semibold">
                    Housing Type
                  </Label>
                  <NativeSelect
                    id="housingType"
                    value={housingType}
                    onChange={(e) => setHousingType(e.target.value)}
                    className="w-full"
                  >
                    <NativeSelectOption value="RENTED">Rented House</NativeSelectOption>
                    <NativeSelectOption value="OWNED">Owned House</NativeSelectOption>
                    <NativeSelectOption value="SHARED">Shared Family Accommodation</NativeSelectOption>
                    <NativeSelectOption value="HOMELESS">Homeless / Temporary Shelter</NativeSelectOption>
                  </NativeSelect>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="housingCondition" className="text-xs font-semibold">
                    Housing Condition / Structure
                  </Label>
                  <Input
                    id="housingCondition"
                    placeholder="e.g. Katcha mud house, 2 small rooms, dilapidated"
                    value={housingCondition}
                    onChange={(e) => setHousingCondition(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Field Assessment Notes
                </Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Record neighborhood observations, water/electricity access, or special hardship story..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="button" onClick={() => setActiveTab("members")} className="text-xs font-semibold">
                  Next: Add Family Members →
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: FAMILY MEMBERS BREAKDOWN */}
            <TabsContent value="members" className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Family & Household Members</h3>
                  <p className="text-xs text-muted-foreground">
                    Add all residing members (Father, Mother, Children, Elderly, Disabled).
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addMember("SPOUSE")}
                    className="text-xs h-8 gap-1"
                  >
                    + Add Spouse
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addMember("SON")}
                    className="text-xs h-8 gap-1"
                  >
                    + Add Child
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addMember("FATHER")}
                    className="text-xs h-8 gap-1"
                  >
                    + Add Elderly
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => addMember("OTHER")}
                    className="text-xs h-8 gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Member
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {members.map((member, idx) => (
                  <Card key={idx} className="border-border bg-muted/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5" /> Member #{idx + 1}: {member.relationToHead}
                        </span>
                        {members.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(idx)}
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="space-y-1">
                          <Label className="text-[11px]">Full Name *</Label>
                          <Input
                            placeholder="Member name"
                            value={member.fullName}
                            onChange={(e) => updateMember(idx, "fullName", e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">CNIC (If applicable)</Label>
                          <Input
                            placeholder="42101-XXXXXXX-X"
                            value={member.cnic || ""}
                            onChange={(e) => updateMember(idx, "cnic", e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">Relation to Head</Label>
                          <NativeSelect
                            value={member.relationToHead}
                            onChange={(e) => updateMember(idx, "relationToHead", e.target.value)}
                            className="h-9 text-xs w-full"
                          >
                            <NativeSelectOption value="HEAD">Head of Household</NativeSelectOption>
                            <NativeSelectOption value="SPOUSE">Spouse / Wife / Husband</NativeSelectOption>
                            <NativeSelectOption value="SON">Son</NativeSelectOption>
                            <NativeSelectOption value="DAUGHTER">Daughter</NativeSelectOption>
                            <NativeSelectOption value="FATHER">Father</NativeSelectOption>
                            <NativeSelectOption value="MOTHER">Mother</NativeSelectOption>
                            <NativeSelectOption value="BROTHER">Brother</NativeSelectOption>
                            <NativeSelectOption value="SISTER">Sister</NativeSelectOption>
                            <NativeSelectOption value="GRANDPARENT">Grandparent</NativeSelectOption>
                            <NativeSelectOption value="OTHER">Other Relative</NativeSelectOption>
                          </NativeSelect>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">Age</Label>
                          <Input
                            type="number"
                            placeholder="Age in years"
                            value={member.age || ""}
                            onChange={(e) => updateMember(idx, "age", Number(e.target.value))}
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">Gender</Label>
                          <NativeSelect
                            value={member.gender || "MALE"}
                            onChange={(e) => updateMember(idx, "gender", e.target.value)}
                            className="h-9 text-xs w-full"
                          >
                            <NativeSelectOption value="MALE">Male</NativeSelectOption>
                            <NativeSelectOption value="FEMALE">Female</NativeSelectOption>
                            <NativeSelectOption value="OTHER">Other</NativeSelectOption>
                          </NativeSelect>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">Employment Status</Label>
                          <NativeSelect
                            value={member.employmentStatus || "UNEMPLOYED"}
                            onChange={(e) => updateMember(idx, "employmentStatus", e.target.value)}
                            className="h-9 text-xs w-full"
                          >
                            <NativeSelectOption value="UNEMPLOYED">Unemployed</NativeSelectOption>
                            <NativeSelectOption value="DAILY_WAGE">Daily Wage Worker</NativeSelectOption>
                            <NativeSelectOption value="EMPLOYED">Salaried Employee</NativeSelectOption>
                            <NativeSelectOption value="SELF_EMPLOYED">Self Employed / Shopkeeper</NativeSelectOption>
                            <NativeSelectOption value="DISABLED">Disabled / Medical</NativeSelectOption>
                            <NativeSelectOption value="RETIRED">Retired / Elderly</NativeSelectOption>
                            <NativeSelectOption value="STUDENT">Student / Minor</NativeSelectOption>
                          </NativeSelect>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">Individual Monthly Income (PKR)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={member.monthlyIncome || ""}
                            onChange={(e) => updateMember(idx, "monthlyIncome", Number(e.target.value))}
                            className="h-9 text-xs"
                          />
                        </div>

                        {/* Vulnerability Checkboxes */}
                        <div className="space-y-1.5 flex flex-col justify-end pb-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={member.isDependent}
                              onChange={(e) => updateMember(idx, "isDependent", e.target.checked)}
                              className="rounded border-input text-primary focus:ring-primary"
                            />
                            <span>Is Financial Dependent</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={member.isDisable}
                              onChange={(e) => updateMember(idx, "isDisable", e.target.checked)}
                              className="rounded border-input text-rose-500 focus:ring-rose-500"
                            />
                            <span className="text-rose-600 dark:text-rose-400 font-medium">Physical/Mental Disability</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={member.isElderly}
                              onChange={(e) => updateMember(idx, "isElderly", e.target.checked)}
                              className="rounded border-input text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-amber-600 dark:text-amber-400 font-medium">Elderly Dependent (60+)</span>
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setActiveTab("basic")} className="text-xs font-semibold">
                  ← Back to Basic Info
                </Button>
                <Button type="button" onClick={() => setActiveTab("assessment")} className="text-xs font-semibold">
                  Next: Financial & Assessment →
                </Button>
              </div>
            </TabsContent>

            {/* TAB 3: ECONOMIC & ASSESSMENT SUMMARY */}
            <TabsContent value="assessment" className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border bg-primary/5">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium block">Total Household Income</span>
                    <span className="text-xl font-extrabold text-foreground block">
                      PKR {totalCalculatedIncome.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-muted-foreground block">Sum of all member earnings</span>
                  </CardContent>
                </Card>

                <Card className="border-border bg-emerald-500/5">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium block">Per Capita Income</span>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
                      PKR {perCapitaIncome.toLocaleString()} / person
                    </span>
                    <span className="text-[11px] text-muted-foreground block">Income split by {totalMembersCount} members</span>
                  </CardContent>
                </Card>

                <Card className="border-border bg-amber-500/5">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium block">Vulnerability Indicators</span>
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <Badge variant="outline" className="text-[11px]">
                        {members.filter((m) => m.isDependent).length} Dependents
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">
                        {members.filter((m) => m.isDisable).length} Disabled
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyIncome" className="text-xs font-semibold">
                  Primary Household Monthly Support / Fixed Income (PKR)
                </Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="0"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("members")} className="text-xs font-semibold">
                  ← Back to Family Members
                </Button>
                <Button type="submit" disabled={isPending} className="text-xs font-semibold gap-1.5">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save & Calculate Assessment
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </form>
  );
}
