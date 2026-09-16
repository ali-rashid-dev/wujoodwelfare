"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Users,
  UserPlus,
  UserCheck,
  HeartHandshake,
  User,
  Home,
  LogOut,
  Heart,
  ChevronsUpDown,
  ExternalLink,
  BookOpen,
  FileText,
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const user = session?.user;

  const navigation = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Applications",
      url: "/dashboard/applications",
      icon: FileText,
      exact: false,
    },
    {
      title: "Welfare Programs",
      url: "/dashboard/programs",
      icon: BookOpen,
      exact: false,
    },
    {
      title: "Beneficiaries",
      url: "/dashboard/beneficiaries",
      icon: Users,
      exact: false,
    },
    {
      title: "Households",
      url: "/dashboard/households",
      icon: Home,
      exact: false,
    },
    {
      title: "Staff & Team",
      url: "/dashboard/staff",
      icon: UserCheck,
      exact: false,
    },
    {
      title: "Volunteers",
      url: "/dashboard/volunteers",
      icon: HeartHandshake,
      exact: false,
    },
    {
      title: "Register Beneficiary",
      url: "/dashboard/beneficiaries/new",
      icon: UserPlus,
      exact: true,
    },
  ];

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const isActive = (url: string, exact: boolean) => {
    if (exact) return pathname === url;
    return pathname.startsWith(url);
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Sidebar Header / Brand Logo */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm tracking-tight text-sidebar-foreground truncate">
              Wujood Welfare
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Management Console
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Core Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url, item.exact);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={active}
                      tooltip={item.title}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-bold"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Main Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/" />}
                  tooltip="Return to Public Site"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/40 rounded-lg transition-colors"
                >
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>Public Website</span>
                  <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer / User Profile */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-xs leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold text-foreground">
                        {user?.name || "User Account"}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {user?.email || "Authenticated"}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-left text-xs">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-xs leading-tight">
                      <span className="truncate font-semibold">{user?.name || "User"}</span>
                      <span className="truncate text-[10px] text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <User className="h-4 w-4 text-primary" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    router.push("/sign-in");
                  }}
                  className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
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
