"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ShieldCheck,
  Calendar,
  Layers,
  Image as ImageIcon,
  Users,
  Mail,
  ArrowRight,
  TrendingUp,
  BadgeCheck,
  Clock3,
  BriefcaseBusiness,
  Check,
} from "lucide-react";
import { DashboardCard } from "@/components/motion/DashboardCard";
import { Stagger } from "@/components/site/Reveal";

export type AdminDashboardStats = {
  approvedVolunteers: number;
  pendingApplications: number;
  activePrograms: number;
  activeProjects: number;
  assignmentsInProgress: number;
  completedAssignments: number;
  unresolvedMessages: number;
  pendingApplicationItems: { id: string; name: string; createdAt: Date }[];
  newMessages: {
    id: string;
    name: string;
    subject: string;
    status: string;
    createdAt: Date;
  }[];
};

export function AdminDashboardView({ stats }: { stats: AdminDashboardStats }) {
  const overviewStats = [
    {
      label: "Approved volunteers",
      value: stats.approvedVolunteers,
      icon: BadgeCheck,
      href: "/admin/approved-volunteers",
      color: "text-success",
    },
    {
      label: "Pending applications",
      value: stats.pendingApplications,
      icon: Clock3,
      href: "/admin/volunteers",
      color: "text-foreground",
    },
    {
      label: "Active programs",
      value: stats.activePrograms,
      icon: Calendar,
      href: "/admin/programs",
      color: "text-primary",
    },
    {
      label: "Active projects",
      value: stats.activeProjects,
      icon: Layers,
      href: "/admin/projects",
      color: "text-primary",
    },
    {
      label: "Assignments in progress",
      value: stats.assignmentsInProgress,
      icon: BriefcaseBusiness,
      href: "/admin/approved-volunteers",
      color: "text-primary",
    },
    {
      label: "Completed assignments",
      value: stats.completedAssignments,
      icon: Check,
      href: "/admin/approved-volunteers",
      color: "text-success",
    },
    {
      label: "Unresolved messages",
      value: stats.unresolvedMessages,
      icon: Mail,
      href: "/admin/messages",
      color: "text-destructive",
    },
  ];

  const adminLinks = [
    {
      href: "/admin/programs",
      icon: Calendar,
      label: "Programs",
      desc: "Manage public program information and settings.",
      color: "text-primary bg-primary/10",
      accent: "hover:border-primary/50",
    },
    {
      href: "/admin/projects",
      icon: Layers,
      label: "Projects",
      desc: "Manage project details and publication status.",
      color: "text-primary bg-primary/10",
      accent: "hover:border-blue-500/50",
    },
    {
      href: "/admin/gallery",
      icon: ImageIcon,
      label: "Gallery",
      desc: "Upload and curate photographs for the public website.",
      color: "text-success bg-success/10",
      accent: "hover:border-emerald-500/50",
    },
    {
      href: "/admin/volunteers",
      icon: Users,
      label: "Volunteers",
      desc: "Review volunteer applications and manage volunteer records.",
      color: "text-foreground bg-secondary/40",
      accent: "hover:border-amber-500/50",
    },
    {
      href: "/admin/messages",
      icon: Mail,
      label: "Contact Messages",
      desc: "Review and respond to messages sent through the contact form.",
      color: "text-primary bg-primary/10",
      accent: "hover:border-purple-500/50",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin Management Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Review current activity and manage public content and volunteer workflows.
        </p>
      </div>

      <section aria-labelledby="overview-heading">
        <div className="mb-4">
          <h2
            id="overview-heading"
            className="text-sm font-bold text-muted-foreground uppercase tracking-wider"
          >
            Overview
          </h2>
        </div>
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {overviewStats.map(({ label, value, icon: Icon, href, color }) => (
            <DashboardCard
              key={label}
            >
              <Link
                href={href}
                className="block h-full rounded-lg border border-border bg-card p-4 transition-[border-color,box-shadow] duration-150 hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium leading-relaxed text-muted-foreground sm:text-sm">
                    {label}
                  </span>
                  <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                </div>
                <p className="mt-3 text-2xl font-bold tabular-nums sm:text-3xl">
                  {value}
                </p>
              </Link>
            </DashboardCard>
          ))}
        </Stagger>
      </section>

      <section aria-labelledby="work-queue-heading" className="space-y-4">
        <div>
          <h2 id="work-queue-heading" className="text-lg font-bold tracking-tight">
            Work queue
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent applications and new messages that may need attention.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <h3 className="font-semibold">Pending applications</h3>
              <Link href="/admin/volunteers" className="text-sm font-semibold text-primary hover:underline">
                Review
              </Link>
            </div>
            {stats.pendingApplicationItems.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No pending applications.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.pendingApplicationItems.map((application) => (
                  <li
                    key={application.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <span className="truncate text-sm font-medium">{application.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(application.createdAt, { addSuffix: true })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <h3 className="font-semibold">New contact messages</h3>
              <Link href="/admin/messages" className="text-sm font-semibold text-primary hover:underline">
                View messages
              </Link>
            </div>
            {stats.newMessages.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No new messages.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.newMessages.map((message) => (
                  <li
                    key={message.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{message.subject}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        From {message.name}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Management Modules
          </h2>
          <span className="text-xs text-muted-foreground">
            {adminLinks.length} Modules Available
          </span>
        </div>
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminLinks.map(({ href, icon: Icon, label, desc, color, accent }) => (
            <DashboardCard
              key={href}
            >
              <Link
                href={href}
                className={`group flex h-full flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-xs transition-[border-color,box-shadow] duration-150 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${accent}`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                        {label}
                      </p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                </div>
              </Link>
            </DashboardCard>
          ))}
        </Stagger>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center">
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
