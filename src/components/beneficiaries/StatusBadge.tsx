"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, ShieldCheck } from "lucide-react";
import { BeneficiaryStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: BeneficiaryStatus | string;
  isVerified?: boolean;
  showVerifiedOnly?: boolean;
}

export function StatusBadge({ status, isVerified, showVerifiedOnly }: StatusBadgeProps) {
  if (showVerifiedOnly) {
    if (isVerified) {
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium gap-1 text-xs px-2 py-0.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Verified
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium gap-1 text-xs px-2 py-0.5">
        Unverified
      </Badge>
    );
  }

  const getStatusConfig = () => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Active",
          className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          icon: CheckCircle2,
        };
      case "VERIFIED":
        return {
          label: "Verified",
          className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          icon: ShieldCheck,
        };
      case "PENDING":
        return {
          label: "Pending",
          className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          icon: Clock,
        };
      case "INACTIVE":
        return {
          label: "Inactive",
          className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-1.5">
      <Badge variant="outline" className={`font-medium gap-1 text-xs px-2.5 py-0.5 shadow-xs ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </Badge>
      {isVerified && status !== "VERIFIED" && (
        <Badge variant="outline" title="Verified Beneficiary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 p-1 rounded-full">
          <ShieldCheck className="w-3 h-3" />
        </Badge>
      )}
    </div>
  );
}
