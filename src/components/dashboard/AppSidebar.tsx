"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useRole } from "@/context/RoleContext";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Image as ImageIcon,
  Users,
  Mail,
  HandHeart,
  UserRound,
  Home,
  LogOut,
  Heart,
  Quote,
  Info,
  ChevronsUpDown,
  ExternalLink,
} from "lucide-react";

interface AppSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
  role?: "admin" | "volunteer";
}

/* ─── Navigation definitions ──────────────────────────────────── */

const ADMIN_NAV = [
  {
    groupLabel: "Overview",
    items: [
      { title: "Admin Dashboard", url: "/admin/dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    groupLabel: "Welfare Content",
    items: [
      { title: "Programs", url: "/admin/programs", icon: Calendar, exact: false },
      { title: "Projects", url: "/admin/projects", icon: Layers, exact: false },
      { title: "Gallery", url: "/admin/gallery", icon: ImageIcon, exact: false },
      { title: "Impact Stories", url: "/admin/stories", icon: Quote, exact: false },
      { title: "Who We Are", url: "/admin/who-we-are", icon: Info, exact: false },
    ],
  },
  {
    groupLabel: "People",
    items: [
      { title: "Volunteers", url: "/admin/volunteers", icon: Users, exact: false },
      { title: "Contact Messages", url: "/admin/messages", icon: Mail, exact: false },
    ],
  },
];

const VOLUNTEER_NAV = [
  {
    groupLabel: "Overview",
    items: [
      { title: "Volunteer Dashboard", url: "/volunteer/dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    groupLabel: "My Work",
    items: [
      { title: "My Assignments", url: "/volunteer/assignments", icon: HandHeart, exact: false },
      { title: "My Profile", url: "/volunteer/profile", icon: UserRound, exact: false },
    ],
  },
];

/* ─── Component ────────────────────────────────────────────────── */

export function AppSidebar({ user, role: propRole }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const roleContext = useRole();

  const activeRole = propRole || roleContext.role || "volunteer";
  const isAdmin = activeRole === "admin";
  const navGroups = isAdmin ? ADMIN_NAV : VOLUNTEER_NAV;
  const homeUrl = isAdmin ? "/admin/dashboard" : "/volunteer/dashboard";

  const getInitials = (name?: string | null) => {
    if (!name) return "WW";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const isActive = (url: string, exact: boolean) =>
    exact ? pathname === url : pathname.startsWith(url);

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Brand Header */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3.5">
        <Link href={homeUrl} className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md group-hover:scale-105 transition-transform">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-sidebar-foreground truncate">
                Wujood Welfare
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${isAdmin ? "bg-primary" : "bg-emerald-500"}`}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {isAdmin ? "Admin Portal" : "Volunteer Portal"}
              </span>
              <Badge
                variant="outline"
                className={`text-[9px] px-1 py-0 h-3.5 font-bold uppercase ${
                  isAdmin
                    ? "border-primary/40 text-primary bg-primary/10"
                    : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                }`}
              >
                {activeRole}
              </Badge>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-3 space-y-4">
        {navGroups.map((group) => (
          <SidebarGroup key={group.groupLabel} className="py-1">
            <SidebarGroupLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 px-2 mb-1 group-data-[collapsible=icon]:hidden">
              {group.groupLabel}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.url, item.exact);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={active}
                        tooltip={item.title}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                          active
                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`}
                        />
                        <span className="truncate">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Public Site Link */}
        <SidebarGroup className="mt-auto pt-2 border-t border-sidebar-border">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/" />}
                  tooltip="Return to Public Site"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Public Website</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-60 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent rounded-xl"
                  >
                    <Avatar className="h-8 w-8 rounded-lg border border-border">
                      {user?.image && <AvatarImage src={user.image} alt={user.name || ""} />}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-xs leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate font-semibold text-foreground">
                          {user?.name || "User"}
                        </span>
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 uppercase shrink-0">
                          {activeRole}
                        </Badge>
                      </div>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {user?.email || ""}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent className="w-60 rounded-xl shadow-lg" side="bottom" align="end" sideOffset={6}>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <Avatar className="h-9 w-9 rounded-lg border border-border">
                      {user?.image && <AvatarImage src={user.image} alt={user.name || ""} />}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-bold text-xs text-foreground">
                          {user?.name || "User"}
                        </span>
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 uppercase shrink-0">
                          {activeRole}
                        </Badge>
                      </div>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {user?.email || ""}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href="/" />}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <Home className="h-4 w-4 text-muted-foreground" />
                  Public Website
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    router.push("/sign-in");
                  }}
                  className="gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
