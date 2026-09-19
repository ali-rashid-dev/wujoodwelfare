"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Truck,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  Home,
  Briefcase,
  BookOpen,
  Filter,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { NewDistributionModal } from "@/components/distribution/NewDistributionModal";
import { DistributionCenterModal } from "@/components/distribution/DistributionCenterModal";

interface DistributionItem {
  id: string;
  distributionCode: string;
  itemsSummary: string;
  quantity: number;
  status: string;
  scheduledDate: string | null;
  distributedAt: string | null;
  confirmedAt: string | null;
  staffName: string | null;
  recipientName: string | null;
  recipientCnic: string | null;
  centerName: string | null;
  receiptNumber: string | null;
  proofPhotoUrl: string | null;
  createdAt: string;
  beneficiary: { id: string; name: string; cnic: string | null; phone: string | null; status: string };
  caseItem: { id: string; caseNumber: string | null; title: string; status: string } | null;
  program: { id: string; code: string; name: string } | null;
  center: { id: string; code: string; name: string; city: string } | null;
  _count: { logs: number };
}

interface DistributionTableProps {
  initialItems: DistributionItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  options: {
    beneficiaries: Array<{ id: string; name: string; cnic: string | null; phone: string | null; status: string }>;
    cases: Array<{ id: string; caseNumber: string | null; title: string; beneficiary: { name: string; cnic: string | null } }>;
    programs: Array<{ id: string; code: string; name: string }>;
    centers: Array<{ id: string; code: string; name: string; city: string }>;
    assistanceRecords: Array<{ id: string; assistanceCode: string | null; type: string; quantity: string | null; beneficiary: { name: string; cnic: string | null } }>;
  };
}

const STATUS_BADGES: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  APPROVED: { label: "1. Approved", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
  SCHEDULED: { label: "2. Scheduled", color: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
  DISTRIBUTED: { label: "3. Out for Delivery", color: "bg-purple-100 text-purple-800 border-purple-200", icon: Truck },
  BENEFICIARY_CONFIRMED: { label: "4. Confirmed Delivery", color: "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold", icon: CheckCircle2 },
  FAILED_DELIVERY: { label: "Delivery Failed", color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle },
};

export function DistributionTable({
  initialItems,
  total,
  currentPage,
  totalPages,
  options,
}: DistributionTableProps) {
  const router = useRouter();
  const [items] = useState<DistributionItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [centerFilter, setCenterFilter] = useState("ALL");

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);

  const handleFilter = (key: string, val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val && val !== "ALL") {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/dashboard/distribution?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilter("search", search);
  };

  return (
    <Card className="shadow-xs border-border/60">
      <CardHeader className="p-4 sm:p-6 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <span>Physical Distribution & Delivery Tracker</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {items.length} of {total} physical delivery items across warehouses and field stations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCenterModalOpen(true)}
              className="text-xs font-semibold gap-1.5"
            >
              <Home className="h-4 w-4" />
              Add Warehouse Center
            </Button>
            <Button
              onClick={() => setIsDeliveryModalOpen(true)}
              className="font-semibold text-xs gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Schedule Delivery
            </Button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 pt-4 border-t border-border/40">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search delivery code, items, beneficiary, CNIC, receipt #..."
              className="pl-9 text-xs h-9"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <Select value={statusFilter} onValueChange={(val) => { if (val) { setStatusFilter(val); handleFilter("status", val); } }}>
              <SelectTrigger className="text-xs h-9 w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Delivery Statuses</SelectItem>
                <SelectItem value="APPROVED">1. Approved</SelectItem>
                <SelectItem value="SCHEDULED">2. Scheduled</SelectItem>
                <SelectItem value="DISTRIBUTED">3. Out for Delivery</SelectItem>
                <SelectItem value="BENEFICIARY_CONFIRMED">4. Confirmed</SelectItem>
                <SelectItem value="FAILED_DELIVERY">Failed Delivery</SelectItem>
              </SelectContent>
            </Select>

            <Select value={centerFilter} onValueChange={(val) => { if (val) { setCenterFilter(val); handleFilter("centerId", val); } }}>
              <SelectTrigger className="text-xs h-9 w-[180px]">
                <SelectValue placeholder="All Centers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Centers / Warehouses</SelectItem>
                {options.centers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="p-4 rounded-full bg-slate-100 text-slate-400 mb-3">
              <Truck className="h-8 w-8" />
            </div>
            <h4 className="font-semibold text-sm text-foreground">No physical distributions logged</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Click &quot;Schedule Delivery&quot; to track physical parcel delivery from a distribution center.
            </p>
            <Button
              onClick={() => setIsDeliveryModalOpen(true)}
              variant="outline"
              size="sm"
              className="mt-4 text-xs font-semibold"
            >
              Schedule First Delivery
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Distribution Code</th>
                  <th className="py-3 px-4">Items & Quantity</th>
                  <th className="py-3 px-4">Recipient / Beneficiary</th>
                  <th className="py-3 px-4">Distribution Center</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4">Staff / Receipt</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {items.map((rec) => {
                  const statusInfo = STATUS_BADGES[rec.status] || STATUS_BADGES.APPROVED;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/dashboard/distribution/${rec.id}`)}
                    >
                      {/* Code & Created */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors font-mono">
                          {rec.distributionCode}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{rec.itemsSummary}</div>
                        <div className="text-[11px] text-muted-foreground">Qty: {rec.quantity} unit(s)</div>
                      </td>

                      {/* Beneficiary & Recipient */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{rec.beneficiary.name}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {rec.recipientName ? `Recipient: ${rec.recipientName}` : rec.beneficiary.cnic || "No CNIC"}
                        </div>
                      </td>

                      {/* Distribution Center */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground flex items-center gap-1">
                          <Home className="h-3 w-3 text-muted-foreground" />
                          <span>{rec.centerName || rec.center?.name || "Field Dispatch"}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {rec.center?.city || "Local Field Hub"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={`gap-1.5 py-1 px-2.5 font-semibold text-[11px] ${statusInfo.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusInfo.label}
                        </Badge>
                      </td>

                      {/* Staff & Receipt */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] font-medium text-foreground">
                          By {rec.staffName || "Field Officer"}
                        </div>
                        {rec.receiptNumber && (
                          <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                            Rcpt #: {rec.receiptNumber}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/dashboard/distribution/${rec.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <span>Track Package</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
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

      <NewDistributionModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        options={options}
      />

      <DistributionCenterModal
        isOpen={isCenterModalOpen}
        onClose={() => setIsCenterModalOpen(false)}
      />
    </Card>
  );
}
