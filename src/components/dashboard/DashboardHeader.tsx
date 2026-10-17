"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, HandHeart } from "lucide-react";

interface DashboardHeaderProps {
  role?: "admin" | "volunteer";
}

export function DashboardHeader({ role: propRole }: DashboardHeaderProps) {
  const pathname = usePathname();
  const roleContext = useRole();
  const activeRole = propRole || roleContext.role || "volunteer";
  const isAdmin = activeRole === "admin";

  /* ── Breadcrumbs ─────────────────────────────────────────────── */
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return [];

    const rootHref = isAdmin ? "/admin/dashboard" : "/volunteer/dashboard";
    const crumbs: { label: string; href: string; isCurrent: boolean }[] = [];

    let accumulatedPath = "";
    const labels: Record<string, string> = {
      admin: "Admin",
      volunteer: "Volunteer",
      dashboard: "Dashboard",
      "approved-volunteers": "Approved Volunteers",
      "my-work": "My Work",
    };
    parts.forEach((seg, i) => {
      accumulatedPath += `/${seg}`;
      const isCurrent = i === parts.length - 1;
      crumbs.push({
        label: labels[seg] ?? seg.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
        href: i === 0 ? rootHref : accumulatedPath,
        isCurrent,
      });
    });

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4">
      <a
        href="#dashboard-content"
        className="sr-only rounded-lg bg-card px-4 py-2 font-semibold text-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      {/* ── Left: Trigger + Breadcrumbs ─────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-5" />

        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList className="text-xs font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href + idx}>
                <BreadcrumbItem>
                  {crumb.isCurrent ? (
                    <BreadcrumbPage className="font-semibold text-foreground">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={crumb.href} />}>
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ── Right: Role indicator badge (Read-only) ─────────────────────────── */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
            isAdmin
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {isAdmin ? (
            <ShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <HandHeart className="h-3.5 w-3.5" />
          )}
          <span>{isAdmin ? "Admin Portal" : "Volunteer Portal"}</span>
        </Badge>
      </div>
    </header>
  );
}
