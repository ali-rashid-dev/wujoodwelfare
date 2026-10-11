"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Calendar,
  Layers,
  Image as ImageIcon,
  Users,
  Mail,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export function AdminDashboardView() {
  const adminLinks = [
    {
      href: "/admin/programs",
      icon: Calendar,
      label: "Programs",
      desc: "Manage welfare programs, community initiatives, and beneficiary quotas.",
      color: "text-primary bg-primary/10",
      accent: "hover:border-primary/50",
    },
    {
      href: "/admin/projects",
      icon: Layers,
      label: "Projects",
      desc: "Track field project execution, milestones, and fundraising goals.",
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
      accent: "hover:border-blue-500/50",
    },
    {
      href: "/admin/gallery",
      icon: ImageIcon,
      label: "Gallery",
      desc: "Upload and curate impact photographs showcased on the public website.",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      accent: "hover:border-emerald-500/50",
    },
    {
      href: "/admin/volunteers",
      icon: Users,
      label: "Volunteers",
      desc: "Review incoming applications, assign tasks, and monitor active workers.",
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      accent: "hover:border-amber-500/50",
    },
    {
      href: "/admin/messages",
      icon: Mail,
      label: "Contact Messages",
      desc: "Read, track, and reply to community inquiries and donor questions.",
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
      accent: "hover:border-purple-500/50",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin Management Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Welcome to the Wujood Welfare administrative console. Manage programs, active field projects, media galleries, volunteer duties, and public inquiries.
        </p>
      </div>

      {/* Management Sections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Management Modules
          </h2>
          <span className="text-xs text-muted-foreground">5 Modules Available</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminLinks.map(({ href, icon: Icon, label, desc, color, accent }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 ${accent}`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {label}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Admin Notice / Quick Summary */}
      <div className="rounded-2xl border border-border bg-muted/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Operational Overview</p>
            <p className="text-xs text-muted-foreground">
              Select any management module above or use the sidebar navigation to manage database records.
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="text-xs font-semibold text-primary hover:underline shrink-0"
        >
          View Public Site &rarr;
        </Link>
      </div>
    </div>
  );
}
