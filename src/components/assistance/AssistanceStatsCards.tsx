"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, DollarSign, Package, Stethoscope, GraduationCap, Shirt, Home, ShieldAlert } from "lucide-react";

interface AssistanceStatsProps {
  stats: {
    total: number;
    totalValuePKR: number;
    breakdown: {
      CASH: number;
      FOOD: number;
      MEDICINE: number;
      EDUCATION: number;
      CLOTHING: number;
      EQUIPMENT: number;
      HOUSING: number;
      EMERGENCY_PACKAGE: number;
    };
  };
}

export function AssistanceStatsCards({ stats }: AssistanceStatsProps) {
  const cards = [
    {
      title: "Total Disbursements",
      value: stats.total,
      description: `PKR ${stats.totalValuePKR.toLocaleString()} financial aid`,
      icon: Gift,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Cash Aid Given",
      value: stats.breakdown.CASH || 0,
      description: "Direct cash assistance",
      icon: DollarSign,
      iconColor: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Food & Ration Bags",
      value: stats.breakdown.FOOD || 0,
      description: "Ration & food relief packages",
      icon: Package,
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Medical & Health",
      value: stats.breakdown.MEDICINE || 0,
      description: "Medicine & healthcare aid",
      icon: Stethoscope,
      iconColor: "text-red-600 bg-red-50 border-red-100",
    },
    {
      title: "Emergency Packages",
      value: stats.breakdown.EMERGENCY_PACKAGE || 0,
      description: "Disaster & crisis relief",
      icon: ShieldAlert,
      iconColor: "text-purple-600 bg-purple-50 border-purple-100",
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
