"use client";

import React, { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Search,
  ArrowLeftRight,
  ShieldCheck,
  HandHeart,
} from "lucide-react";

interface DashboardHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { role, setRole, isAdmin } = useRole();
  const [searchQuery, setSearchQuery] = useState("");

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

  /* ── Mock notifications ──────────────────────────────────────── */
  const notifications = [
    { id: "1", title: "New volunteer application", time: "10m ago", unread: true },
    { id: "2", title: "Contact message from donor", time: "1h ago", unread: true },
    { id: "3", title: "Assignment accepted", time: "3h ago", unread: false },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

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

      {/* ── Right: Search + Role Switcher + Bell ─────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative hidden lg:flex items-center w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 pr-10 text-xs bg-muted/40 border-border rounded-lg"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-4 select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[9px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>

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

        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                )}
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-72 rounded-xl p-0 shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-semibold text-xs text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-xs cursor-pointer hover:bg-muted/50 transition-colors ${
                    n.unread ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-foreground">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {n.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
