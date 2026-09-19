"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Clock, CheckCircle2, Award, AlertTriangle } from "lucide-react";

interface DistributionStatsProps {
  stats: {
    total: number;
    approved: number;
    scheduled: number;
    distributed: number;
    confirmed: number;
    failed: number;
  };
}

export function DistributionStatsCards({ stats }: DistributionStatsProps) {
  const cards = [
    {
      title: "Total Packages Logged",
      value: stats.total,
      description: "Physical delivery parcels",
      icon: Truck,
      iconColor: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Scheduled & Pending",
      value: stats.approved + stats.scheduled,
      description: "Ready at distribution center",
      icon: Clock,
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Distributed Out",
      value: stats.distributed,
      description: "Handed over to delivery officer",
      icon: Truck,
      iconColor: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Beneficiary Confirmed",
      value: stats.confirmed,
      description: "Receipt & proof verified",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Failed / Undelivered",
      value: stats.failed,
      description: "Address missing or refused",
      icon: AlertTriangle,
      iconColor: stats.failed > 0 ? "text-red-600 bg-red-50 border-red-200" : "text-slate-600 bg-slate-50 border-slate-200",
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
