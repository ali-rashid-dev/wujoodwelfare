"use client";

import React from "react";
import Link from "next/link";
import {
  HandHeart,
  Compass,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function VolunteerDashboardView() {
  const volunteerLinks = [
    {
      href: "/volunteer/opportunities",
      icon: Compass,
      label: "Volunteer Opportunities",
      desc: "Browse open community drives, medical camps, and relief distributions to participate in.",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      accent: "hover:border-emerald-500/50",
    },
    {
      href: "/volunteer/assignments",
      icon: HandHeart,
      label: "My Assignments",
      desc: "View, accept, and manage tasks assigned to you by the Wujood Welfare administration.",
      color: "text-primary bg-primary/10",
      accent: "hover:border-primary/50",
    },
    {
      href: "/volunteer/progress",
      icon: Clock,
      label: "Progress & Hours",
      desc: "Log your contribution hours and submit work updates on your assigned tasks.",
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
      accent: "hover:border-blue-500/50",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-linear-to-r from-emerald-500/15 via-emerald-500/5 to-transparent p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
          <HandHeart className="h-3.5 w-3.5" />
          Volunteer Community Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Volunteer Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Welcome to your volunteer hub. Explore upcoming field drives, track your assigned duties, and log your service hours to make a lasting impact in our community.
        </p>
      </div>

      {/* Workspace Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Your Workspace
          </h2>
          <span className="text-xs text-muted-foreground">3 Modules Available</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {volunteerLinks.map(({ href, icon: Icon, label, desc, color, accent }) => (
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
                    <p className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {label}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all" />
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

      {/* Community Impact Card */}
      <div className="rounded-2xl border border-border bg-muted/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Ready to participate?</p>
            <p className="text-xs text-muted-foreground">
              Check out open opportunities to sign up for scheduled drives, or view tasks assigned to you.
            </p>
          </div>
        </div>
        <Link
          href="/volunteer/opportunities"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
        >
          Explore Opportunities &rarr;
        </Link>
      </div>
    </div>
  );
}
