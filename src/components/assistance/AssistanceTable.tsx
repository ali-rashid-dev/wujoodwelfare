"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Gift,
  Search,
  Plus,
  DollarSign,
  Package,
  Stethoscope,
  GraduationCap,
  Shirt,
  Home,
  ShieldAlert,
  Wrench,
  User,
  Briefcase,
  BookOpen,
  Filter,
  Trash2,
  Calendar,
} from "lucide-react";
import { RecordAssistanceModal } from "@/components/assistance/RecordAssistanceModal";
import { deleteAssistance } from "@/app/(dashboard)/dashboard/assistance/assistance-actions";
import { toast } from "sonner";

interface AssistanceItem {
  id: string;
  assistanceCode: string;
  type: string;
  description: string | null;
  amount: number | null;
  quantity: string | null;
  status: string;
  distributionMethod: string;
  givenAt: string;
  givenBy: string | null;
  notes: string | null;
  beneficiary: { id: string; name: string; cnic: string | null; phone: string | null; status: string };
  caseItem: { id: string; caseNumber: string | null; title: string; status: string } | null;
  program: { id: string; code: string; name: string } | null;
  distributions: Array<{ id: string; distributionCode: string; status: string }>;
}

interface AssistanceTableProps {
  initialItems: AssistanceItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  options: {
    beneficiaries: Array<{ id: string; name: string; cnic: string | null; phone: string | null; status: string }>;
    cases: Array<{ id: string; caseNumber: string | null; title: string; beneficiary: { name: string; cnic: string | null } }>;
    programs: Array<{ id: string; code: string; name: string; assistanceType: string }>;
    staff: Array<{ id: string; name: string; designation: string; department: string }>;
  };
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  CASH: { label: "Cash Aid", color: "bg-blue-100 text-blue-800 border-blue-200", icon: DollarSign },
  FOOD: { label: "Food & Ration", color: "bg-amber-100 text-amber-800 border-amber-200", icon: Package },
  MEDICINE: { label: "Medicine", color: "bg-red-100 text-red-800 border-red-200", icon: Stethoscope },
  MEDICAL: { label: "Medical Aid", color: "bg-red-100 text-red-800 border-red-200", icon: Stethoscope },
  EDUCATION: { label: "Education", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: GraduationCap },
  CLOTHING: { label: "Clothing", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Shirt },
  EQUIPMENT: { label: "Equipment", color: "bg-cyan-100 text-cyan-800 border-cyan-200", icon: Wrench },
  HOUSING: { label: "Housing Aid", color: "bg-orange-100 text-orange-800 border-orange-200", icon: Home },
  EMERGENCY_PACKAGE: { label: "Emergency Relief", color: "bg-purple-100 text-purple-800 border-purple-200", icon: ShieldAlert },
};

export function AssistanceTable({
  initialItems,
  total,
  currentPage,
  totalPages,
  options,
}: AssistanceTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const items = initialItems;
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const visibleItems = items.filter((item) => !deletedIds.includes(item.id));

  const handleFilter = (key: string, val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val && val !== "ALL") {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    if (key === "page") params.set("page", val);
    else params.set("page", "1");
    router.push(`/dashboard/assistance?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilter("search", search);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete assistance record ${code}?`)) return;
    const res = await deleteAssistance(id);
    if (res.success) {
      toast.success("Assistance record deleted");
      setDeletedIds((ids) => [...ids, id]);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete assistance record");
    }
  };

  return (
    <Card className="shadow-xs border-border/60">
      <CardHeader className="p-4 sm:p-6 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <span>Assistance Disbursements Log</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {visibleItems.length} of {total} aid disbursements provided across beneficiaries, cases, and programs
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="font-semibold text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Record Provided Assistance
          </Button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 pt-4 border-t border-border/40">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, beneficiary name, CNIC, staff..."
              className="pl-9 text-xs h-9"
            />
          </form>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <Select value={typeFilter} onValueChange={(val) => { if (val) { setTypeFilter(val); handleFilter("type", val); } }}>
              <SelectTrigger className="text-xs h-9 w-[190px]">
                <SelectValue placeholder="All Assistance Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Assistance Types</SelectItem>
                <SelectItem value="CASH">Cash Aid</SelectItem>
                <SelectItem value="FOOD">Food & Ration Pack</SelectItem>
                <SelectItem value="MEDICINE">Medicine & Healthcare</SelectItem>
                <SelectItem value="EDUCATION">Education / Scholarship</SelectItem>
                <SelectItem value="CLOTHING">Clothing Pack</SelectItem>
                <SelectItem value="EQUIPMENT">Equipment & Wheelchair</SelectItem>
                <SelectItem value="HOUSING">Housing Aid</SelectItem>
                <SelectItem value="EMERGENCY_PACKAGE">Emergency Package</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {visibleItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="p-4 rounded-full bg-slate-100 text-slate-400 mb-3">
              <Gift className="h-8 w-8" />
            </div>
            <h4 className="font-semibold text-sm text-foreground">No assistance disbursements found</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Click &quot;Record Provided Assistance&quot; to record cash, food, medicine, or package aid given to a beneficiary.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              size="sm"
              className="mt-4 text-xs font-semibold"
            >
              Record Assistance
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Assistance Code</th>
                  <th className="py-3 px-4">Beneficiary / CNIC</th>
                  <th className="py-3 px-4">Assistance Type</th>
                  <th className="py-3 px-4 text-right">Value / Quantity</th>
                  <th className="py-3 px-4">Method & Staff</th>
                  <th className="py-3 px-4">Context Links</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {visibleItems.map((ast) => {
                  const typeInfo = TYPE_CONFIG[ast.type] || TYPE_CONFIG.CASH;
                  const TypeIcon = typeInfo.icon;

                  return (
                    <tr key={ast.id} className="hover:bg-muted/30 transition-colors">
                      {/* Code & Date */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="font-bold text-foreground font-mono">{ast.assistanceCode}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(ast.givenAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Beneficiary */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/dashboard/beneficiaries/${ast.beneficiary.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{ast.beneficiary.name}</span>
                        </Link>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {ast.beneficiary.cnic || "No CNIC"}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={`gap-1.5 py-1 px-2.5 font-semibold text-[11px] ${typeInfo.color}`}>
                          <TypeIcon className="h-3.5 w-3.5" />
                          {typeInfo.label}
                        </Badge>
                      </td>

                      {/* Amount / Quantity */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-foreground text-sm">
                          {ast.amount ? `PKR ${ast.amount.toLocaleString()}` : "—"}
                        </div>
                        {ast.quantity && (
                          <div className="text-[11px] text-muted-foreground">{ast.quantity}</div>
                        )}
                      </td>

                      {/* Method & Staff */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground text-[11px]">
                          {ast.distributionMethod.replace("_", " ")}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          By {ast.givenBy || "Welfare Officer"}
                        </div>
                      </td>

                      {/* Case / Program Context */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {ast.caseItem && (
                            <Link href={`/dashboard/cases/${ast.caseItem.id}`}>
                              <Badge variant="outline" className="text-[10px] gap-1 font-mono bg-blue-50/50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                <Briefcase className="h-3 w-3" />
                                {ast.caseItem.caseNumber || "Case"}
                              </Badge>
                            </Link>
                          )}
                          {ast.program && (
                            <Link href={`/dashboard/programs/${ast.program.id}`}>
                              <Badge variant="outline" className="text-[10px] gap-1 font-mono bg-emerald-50/50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                <BookOpen className="h-3 w-3" />
                                {ast.program.code}
                              </Badge>
                            </Link>
                          )}
                          {!ast.caseItem && !ast.program && (
                            <span className="text-muted-foreground text-[11px] italic">Direct Aid</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(ast.id, ast.assistanceCode)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border/50 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handleFilter("page", String(currentPage - 1))}
                className="text-xs h-8"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => handleFilter("page", String(currentPage + 1))}
                className="text-xs h-8"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <RecordAssistanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        options={options}
      />
    </Card>
  );
}
