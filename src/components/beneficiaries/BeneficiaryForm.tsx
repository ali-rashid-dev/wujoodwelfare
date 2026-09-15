"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Phone,
  MapPin,
  Users,
  BadgeDollarSign,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createBeneficiary, updateBeneficiary } from "@/app/(dashboard)/dashboard/beneficiaries/beneficiaries";
import { beneficiaryFormSchema, BeneficiaryFormInput } from "@/validation/beneficiary";

interface BeneficiaryFormProps {
  initialData?: {
    id: string;
    name: string;
    cnic?: string | null;
    fatherName?: string | null;
    dateOfBirth?: string | Date | null;
    gender?: string | null;
    status: string;
    verifiedAt?: string | Date | null;
    notes?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    address?: {
      street?: string | null;
      city?: string | null;
      district?: string | null;
      province?: string | null;
      postalCode?: string | null;
    } | null;
    family?: {
      maritalStatus?: string | null;
      spouseName?: string | null;
      dependents?: number | null;
      disabledMembers?: number | null;
    } | null;
    economic?: {
      employmentStatus?: string | null;
      occupation?: string | null;
      monthlyIncome?: number | null;
      housingType?: string | null;
    } | null;
  };
  isEdit?: boolean;
}

export function BeneficiaryForm({ initialData, isEdit = false }: BeneficiaryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState("personal");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Personal State
  const [name, setName] = useState(initialData?.name || "");
  const [cnic, setCnic] = useState(initialData?.cnic || "");
  const [fatherName, setFatherName] = useState(initialData?.fatherName || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    initialData?.dateOfBirth
      ? (() => {
        const date = new Date(initialData.dateOfBirth);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      })()
      : ""
  );
  const [gender, setGender] = useState(initialData?.gender || "MALE");
  const [status, setStatus] = useState(initialData?.status || "PENDING");
  const [isVerified, setIsVerified] = useState(Boolean(initialData?.verifiedAt));
  const [notes, setNotes] = useState(initialData?.notes || "");

  // Contact State
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [sameAsPhone, setSameAsPhone] = useState(
    Boolean(initialData?.phone && initialData?.whatsapp && initialData.phone === initialData.whatsapp)
  );

  // Address State
  const [street, setStreet] = useState(initialData?.address?.street || "");
  const [city, setCity] = useState(initialData?.address?.city || "Karachi");
  const [district, setDistrict] = useState(initialData?.address?.district || "");
  const [province, setProvince] = useState(initialData?.address?.province || "Sindh");
  const [postalCode, setPostalCode] = useState(initialData?.address?.postalCode || "");

  // Family State
  const [maritalStatus, setMaritalStatus] = useState(initialData?.family?.maritalStatus || "SINGLE");
  const [spouseName, setSpouseName] = useState(initialData?.family?.spouseName || "");
  const [dependents, setDependents] = useState(initialData?.family?.dependents ?? 0);
  const [disabledMembers, setDisabledMembers] = useState(initialData?.family?.disabledMembers ?? 0);

  // Economic State
  const [employmentStatus, setEmploymentStatus] = useState(initialData?.economic?.employmentStatus || "UNEMPLOYED");
  const [occupation, setOccupation] = useState(initialData?.economic?.occupation || "");
  const [monthlyIncome, setMonthlyIncome] = useState(initialData?.economic?.monthlyIncome ?? 0);
  const [housingType, setHousingType] = useState(initialData?.economic?.housingType || "RENTED");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData: BeneficiaryFormInput = {
      name,
      cnic,
      fatherName,
      dateOfBirth,
      gender: gender as any,
      status: status as any,
      isVerified,
      notes,
      phone,
      whatsapp: sameAsPhone ? phone : whatsapp,
      email,
      address: {
        street,
        city,
        district,
        province,
        postalCode,
      },
      family: {
        maritalStatus: maritalStatus as any,
        spouseName,
        dependents: Number(dependents),
        disabledMembers: Number(disabledMembers),
      },
      economic: {
        employmentStatus: employmentStatus as any,
        occupation,
        monthlyIncome: Number(monthlyIncome),
        housingType: housingType as any,
      },
    };

    const validation = beneficiaryFormSchema.safeParse(formData);
    if (!validation.success) {
      const firstErr = validation.error.issues[0];
      const fieldPath = firstErr.path.join(" -> ");
      const msg = `${fieldPath ? fieldPath + ": " : ""}${firstErr.message}`;
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    startTransition(async () => {
      let res;
      if (isEdit && initialData?.id) {
        res = await updateBeneficiary(initialData.id, formData);
      } else {
        res = await createBeneficiary(formData);
      }

      if (res.success) {
        toast.success(isEdit ? "Beneficiary profile updated successfully!" : "New beneficiary registered!");
        const targetId = isEdit ? initialData?.id : ("beneficiaryId" in res ? res.beneficiaryId : undefined);
        router.push(targetId ? `/dashboard/beneficiaries/${targetId}` : "/dashboard/beneficiaries");
      } else {
        setErrorMsg(res.error || "Operation failed");
        toast.error(res.error || "Operation failed");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-9 w-9 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {isEdit ? `Edit Beneficiary: ${initialData?.name}` : "Register New Beneficiary"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Update personal, family, economic and contact profile information"
                : "Fill in the details below to create a central beneficiary profile"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/beneficiaries")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="gap-1.5 font-semibold text-xs h-9 px-4"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {isEdit ? "Update Profile" : "Save Beneficiary"}
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

      {/* Form Tabs Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="personal" className="gap-1.5 text-xs">
                <User className="w-3.5 h-3.5" /> Personal
              </TabsTrigger>
              <TabsTrigger value="contact" className="gap-1.5 text-xs">
                <Phone className="w-3.5 h-3.5" /> Contact
              </TabsTrigger>
              <TabsTrigger value="address" className="gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5" /> Address
              </TabsTrigger>
              <TabsTrigger value="family" className="gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5" /> Family
              </TabsTrigger>
              <TabsTrigger value="economic" className="gap-1.5 text-xs">
                <BadgeDollarSign className="w-3.5 h-3.5" /> Economic
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: PERSONAL */}
            <TabsContent value="personal" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    required
                    placeholder="e.g. Muhammad Ali Shah"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherName" className="text-xs font-semibold">
                    Father / Husband Name
                  </Label>
                  <Input
                    id="fatherName"
                    placeholder="e.g. Shah Hussain"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnic" className="text-xs font-semibold">
                    CNIC Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cnic"
                    required
                    placeholder="42101-1234567-1"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-xs font-semibold">
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-xs font-semibold">
                    Gender
                  </Label>
                  <Select value={gender} onValueChange={(val) => val && setGender(val)}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-xs font-semibold">
                    Profile Status
                  </Label>
                  <Select value={status} onValueChange={(val) => val && setStatus(val)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending Verification</SelectItem>
                      <SelectItem value="ACTIVE">Active Beneficiary</SelectItem>
                      <SelectItem value="VERIFIED">Verified & Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isVerified"
                  checked={isVerified}
                  onCheckedChange={(checked) => setIsVerified(Boolean(checked))}
                />
                <Label htmlFor="isVerified" className="text-xs font-medium cursor-pointer">
                  Mark as officially verified (background check complete)
                </Label>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Personal Remarks / Case Summary
                </Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Additional context or remarks regarding this beneficiary..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </TabsContent>

            {/* TAB 2: CONTACT */}
            <TabsContent value="contact" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-semibold">
                    Primary Mobile Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="0300-1234567"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPhone(val);
                      if (sameAsPhone) setWhatsapp(val);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="whatsapp" className="text-xs font-semibold">
                      WhatsApp Number
                    </Label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                      <Checkbox
                        checked={sameAsPhone}
                        onCheckedChange={(checked) => {
                          const isChecked = Boolean(checked);
                          setSameAsPhone(isChecked);
                          if (isChecked) setWhatsapp(phone);
                        }}
                      />
                      <span>Same as Phone</span>
                    </label>
                  </div>
                  <Input
                    id="whatsapp"
                    placeholder="0300-1234567"
                    disabled={sameAsPhone}
                    value={sameAsPhone ? phone : whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    Email Address (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="beneficiary@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: ADDRESS */}
            <TabsContent value="address" className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="street" className="text-xs font-semibold">
                  Street Address / House No / Goth
                </Label>
                <Input
                  id="street"
                  placeholder="House #123, Sector 5-G, Orangi Town"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-semibold">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    required
                    placeholder="Karachi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district" className="text-xs font-semibold">
                    District
                  </Label>
                  <Input
                    id="district"
                    placeholder="Karachi West"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province" className="text-xs font-semibold">
                    Province
                  </Label>
                  <Select value={province} onValueChange={(val) => val && setProvince(val)}>
                    <SelectTrigger id="province">
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sindh">Sindh</SelectItem>
                      <SelectItem value="Punjab">Punjab</SelectItem>
                      <SelectItem value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</SelectItem>
                      <SelectItem value="Balochistan">Balochistan</SelectItem>
                      <SelectItem value="Gilgit-Baltistan">Gilgit-Baltistan</SelectItem>
                      <SelectItem value="Azad Kashmir">Azad Kashmir</SelectItem>
                      <SelectItem value="Islamabad Capital Territory">Islamabad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-xs font-semibold">
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    placeholder="75800"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: FAMILY */}
            <TabsContent value="family" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus" className="text-xs font-semibold">
                    Marital Status
                  </Label>
                  <Select value={maritalStatus} onValueChange={(val) => val && setMaritalStatus(val)}>
                    <SelectTrigger id="maritalStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="MARRIED">Married</SelectItem>
                      <SelectItem value="WIDOWED">Widowed</SelectItem>
                      <SelectItem value="DIVORCED">Divorced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spouseName" className="text-xs font-semibold">
                    Spouse Name
                  </Label>
                  <Input
                    id="spouseName"
                    placeholder="Spouse name (if married)"
                    value={spouseName}
                    onChange={(e) => setSpouseName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dependents" className="text-xs font-semibold">
                    Total Dependents
                  </Label>
                  <Input
                    id="dependents"
                    type="number"
                    min="0"
                    value={dependents}
                    onChange={(e) => setDependents(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disabledMembers" className="text-xs font-semibold">
                    Disabled Family Members
                  </Label>
                  <Input
                    id="disabledMembers"
                    type="number"
                    min="0"
                    value={disabledMembers}
                    onChange={(e) => setDisabledMembers(Number(e.target.value))}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: ECONOMIC */}
            <TabsContent value="economic" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employment" className="text-xs font-semibold">
                    Employment Status
                  </Label>
                  <Select value={employmentStatus} onValueChange={(val) => val && setEmploymentStatus(val)}>
                    <SelectTrigger id="employment">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNEMPLOYED">Unemployed</SelectItem>
                      <SelectItem value="DAILY_WAGER">Daily Wager</SelectItem>
                      <SelectItem value="EMPLOYED">Employed (Salaried)</SelectItem>
                      <SelectItem value="SELF_EMPLOYED">Self-Employed / Small Shop</SelectItem>
                      <SelectItem value="DISABLED">Disabled / Unable to work</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation" className="text-xs font-semibold">
                    Occupation / Trade
                  </Label>
                  <Input
                    id="occupation"
                    placeholder="e.g. Laborer, Carpenter, Electrician"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income" className="text-xs font-semibold">
                    Estimated Household Income (PKR)
                  </Label>
                  <Input
                    id="income"
                    type="number"
                    min="0"
                    placeholder="e.g. 25000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="housing" className="text-xs font-semibold">
                    Housing Condition
                  </Label>
                  <Select value={housingType} onValueChange={(val) => val && setHousingType(val)}>
                    <SelectTrigger id="housing">
                      <SelectValue placeholder="Select housing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RENTED">Rented House / Room</SelectItem>
                      <SelectItem value="OWNED">Self-Owned House</SelectItem>
                      <SelectItem value="SHARED">Shared Living</SelectItem>
                      <SelectItem value="HOMELESS">Homeless / Temporary Shelter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </form>
  );
}
