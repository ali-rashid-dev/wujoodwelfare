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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftRight,
  ShieldCheck,
  HandHeart,
} from "lucide-react";

export function DashboardHeader() {
  const pathname = usePathname();
  const { setRole, isAdmin } = useRole();

  /* ── Breadcrumbs ─────────────────────────────────────────────── */
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) {
      return [{ label: "Dashboard", href: "/dashboard", isCurrent: true }];
    }
    const crumbs = [{ label: "Dashboard", href: "/dashboard", isCurrent: false }];
    let path = "/dashboard";
    parts.slice(1).forEach((seg, i, arr) => {
      path += `/${seg}`;
      crumbs.push({
        label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
        href: path,
        isCurrent: i === arr.length - 1,
      });
    });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur">
      {/* ── Left: Trigger + Breadcrumbs + Role Badge ─────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-5" />

        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList className="text-xs font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
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

        {/* Role indicator badge */}
        <Badge
          variant="outline"
          className={`hidden md:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
            isAdmin
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {isAdmin ? (
            <ShieldCheck className="h-3 w-3" />
          ) : (
            <HandHeart className="h-3 w-3" />
          )}
          {isAdmin ? "Admin" : "Volunteer"}
        </Badge>
      </div>

      {/* ── Right: Role Switcher ─────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRole(isAdmin ? "volunteer" : "admin")}
          className="h-8 gap-1.5 text-xs font-semibold rounded-lg border-border hover:bg-muted/70 transition-all"
          title={`Switch to ${isAdmin ? "Volunteer" : "Admin"} dashboard`}
        >
          <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">
            View as{" "}
            <span className="font-bold">{isAdmin ? "Volunteer" : "Admin"}</span>
          </span>
        </Button>

      </div>
    </header>
  );
}
