"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Clock, CheckCircle2, AlertTriangle, XCircle, Award } from "lucide-react";

interface VerificationStatsProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    verified: number;
    rejected: number;
    flaggedFraud: number;
    averageScore: number;
  };
}

export function VerificationStatsCards({ stats }: VerificationStatsProps) {
  const cards = [
    {
      title: "Total Verifications",
      value: stats.total,
      description: "Identity & eligibility audits",
      icon: ShieldCheck,
      iconColor: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "In Progress",
      value: stats.inProgress + stats.pending,
      description: "Under investigation / field check",
      icon: Clock,
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Verified & Qualified",
      value: stats.verified,
      description: "Approved for welfare assistance",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Fraud / Rejected",
      value: stats.rejected + stats.flaggedFraud,
      description: `${stats.flaggedFraud} flagged fraud cases`,
      icon: stats.flaggedFraud > 0 ? AlertTriangle : XCircle,
      iconColor: stats.flaggedFraud > 0 ? "text-red-600 bg-red-50 border-red-200" : "text-slate-600 bg-slate-50 border-slate-200",
    },
    {
      title: "Avg Eligibility Score",
      value: `${stats.averageScore}/100`,
      description: "Mean PMT score for verified cases",
      icon: Award,
      iconColor: "text-violet-600 bg-violet-50 border-violet-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="shadow-xs border-border/60 hover:border-border transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1 tracking-tight">{card.value}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{card.description}</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${card.iconColor} shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
