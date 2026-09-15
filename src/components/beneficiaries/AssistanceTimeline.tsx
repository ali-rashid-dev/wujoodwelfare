"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Utensils, Stethoscope, GraduationCap, Home, AlertCircle, Briefcase, HelpCircle, Calendar } from "lucide-react";
import { AssistanceType } from "@prisma/client";

export interface AssistanceItem {
  id: string;
  type: AssistanceType | string;
  amount?: number | null;
  description?: string | null;
  givenAt: string | Date;
  givenBy?: string | null;
}

interface AssistanceTimelineProps {
  items: AssistanceItem[];
}

export function AssistanceTimeline({ items }: AssistanceTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-10 px-4 border border-dashed rounded-xl bg-muted/30">
        <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium text-foreground">No assistance history recorded yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Click "Record Aid" to log financial, medical, or ration support.
        </p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "FINANCIAL":
        return DollarSign;
      case "FOOD_RATION":
        return Utensils;
      case "MEDICAL":
        return Stethoscope;
      case "EDUCATION":
        return GraduationCap;
      case "SHELTER":
        return Home;
      case "EMERGENCY_RELIEF":
        return AlertCircle;
      case "JOB_PLACEMENT":
        return Briefcase;
      default:
        return HelpCircle;
    }
  };

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary/80 before:via-primary/30 before:to-transparent">
      {items.map((item) => {
        const Icon = getTypeIcon(item.type);
        const dateStr = new Date(item.givenAt).toLocaleDateString("en-PK", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return (
          <div key={item.id} className="relative group">
            <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>

            <Card className="hover:border-primary/40 transition-colors shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="font-semibold text-xs px-2.5 py-0.5 gap-1">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                        {item.type.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                    </div>

                    <h4 className="font-semibold text-foreground text-sm mt-1">
                      {item.description || "Assistance Provided"}
                    </h4>

                    {item.givenBy && (
                      <p className="text-xs text-muted-foreground italic">
                        Authorized by: {item.givenBy}
                      </p>
                    )}
                  </div>

                  {item.amount != null && item.amount > 0 && (
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">Amount Provided</span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPKR(item.amount)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
