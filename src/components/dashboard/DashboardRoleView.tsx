"use client";

import React from "react";
import { useRole } from "@/context/RoleContext";
import {
  ShieldCheck,
  HandHeart,
  Calendar,
  Layers,
  Image as ImageIcon,
  Users,
  Mail,
  Compass,
  Clock,
  ArrowLeftRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/* ──────────────────────────────────────────────────────────
   Admin Home View
────────────────────────────────────────────────────────── */

function AdminHome() {
  const adminLinks = [
    {
      href: "/dashboard/programs",
      icon: Calendar,
      label: "Programs",
      desc: "Manage welfare programs and community initiatives.",
      color: "text-primary bg-primary/10",
    },
    {
      href: "/dashboard/projects",
      icon: Layers,
      label: "Projects",
      desc: "Track field project progress and fundraising drives.",
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      href: "/dashboard/gallery",
      icon: ImageIcon,
      label: "Gallery",
      desc: "Upload and curate impact photos for the website.",
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      href: "/dashboard/volunteers",
      icon: Users,
      label: "Volunteers",
      desc: "Review applications and assign field tasks.",
      color: "text-amber-600 bg-amber-500/10",
    },
    {
      href: "/dashboard/messages",
      icon: Mail,
      label: "Contact Messages",
      desc: "Read and respond to public inquiries.",
      color: "text-purple-600 bg-purple-500/10",
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
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Manage programs, projects, gallery, volunteers, and contact messages from here. Use the sidebar to navigate to each section.
        </p>
      </div>

      {/* Quick-access cards */}
      <div>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Management Sections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminLinks.map(({ href, icon: Icon, label, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className={`mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Volunteer Home View
────────────────────────────────────────────────────────── */

function VolunteerHome() {
  const volunteerLinks = [
    {
      href: "/dashboard/opportunities",
      icon: Compass,
      label: "Volunteer Opportunities",
      desc: "Browse open field drives and community campaigns to join.",
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      href: "/dashboard/assignments",
      icon: HandHeart,
      label: "My Assignments",
      desc: "View and respond to task assignments from the admin team.",
      color: "text-primary bg-primary/10",
    },
    {
      href: "/dashboard/progress",
      icon: Clock,
      label: "Progress & Hours",
      desc: "Log service hours and update task completion status.",
      color: "text-blue-600 bg-blue-500/10",
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
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          View volunteer opportunities, respond to assignments from the admin team, and update your work progress and service hours.
        </p>
      </div>

      {/* Quick-access cards */}
      <div>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Your Workspace
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {volunteerLinks.map(({ href, icon: Icon, label, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-emerald-500/40 hover:shadow-md transition-all"
            >
              <div className={`mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                  {label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main role-switching wrapper
────────────────────────────────────────────────────────── */

export function DashboardRoleView() {
  const { role, isAdmin, setRole } = useRole();

  return (
    <div className="relative">
      {/* Floating role toggle pill at top-right */}
      <div className="absolute -top-2 right-0 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRole(isAdmin ? "volunteer" : "admin")}
          className="h-7 gap-1.5 text-[11px] font-semibold rounded-full border-border hover:bg-muted/70 shadow-sm"
        >
          <ArrowLeftRight className="h-3 w-3 text-primary" />
          Preview as {isAdmin ? "Volunteer" : "Admin"}
        </Button>
      </div>

      {isAdmin ? <AdminHome /> : <VolunteerHome />}
    </div>
  );
}
