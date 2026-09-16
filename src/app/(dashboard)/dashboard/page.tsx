"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, LogOut, Loader2, ShieldCheck, Users, ArrowRight, Heart, BookOpen, FileText } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-muted-foreground text-xs font-medium">Verifying account session...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] py-12">
        <p className="text-muted-foreground text-xs font-medium">Redirecting to Sign In...</p>
      </div>
    );
  }

  const { user } = session;

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary/20" /> Welcome back, {user.name || "Member"}!
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Wujood Welfare Administrative Console & Central Operations.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">{user.name || "User Account"}</h2>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" /> Authenticated
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await signOut();
              router.push("/sign-in");
            }}
            className="gap-2 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Account Status</span>
            <p className="mt-2 text-2xl font-bold text-primary">Active Member</p>
            <p className="text-[11px] text-muted-foreground mt-1">Verified via Better Auth</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Impact Contributions</span>
            <p className="mt-2 text-2xl font-bold text-foreground">0 Donations</p>
            <p className="text-[11px] text-muted-foreground mt-1">No recorded donations yet</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Volunteer Status</span>
            <p className="mt-2 text-2xl font-bold text-foreground">Registered</p>
            <p className="text-[11px] text-muted-foreground mt-1">Ready for community drives</p>
          </CardContent>
        </Card>
      </div>

      {/* Welfare Modules Navigation Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Welfare Management Modules</CardTitle>
          <CardDescription className="text-xs">
            Access applications workflow, central program configurations, aid tracking, staff operations, and volunteer management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => router.push("/dashboard/applications")}
              className="flex items-center justify-between p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-sm text-foreground group-hover:text-blue-600 transition-colors">
                    Welfare Applications
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  5-step assistance workflow pipeline: Intake → Review → Verification → Assessment → Decision.
                </p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs text-blue-600 gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                Open <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div
              onClick={() => router.push("/dashboard/programs")}
              className="flex items-center justify-between p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <h4 className="font-bold text-sm text-foreground group-hover:text-purple-600 transition-colors">
                    Welfare Programs
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Central program configuration, budget tracking, eligibility rules, and aid distribution.
                </p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs text-purple-600 gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                Open <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div
              onClick={() => router.push("/dashboard/beneficiaries")}
              className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    Beneficiary Management
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Search, verify, and track aid distribution for welfare beneficiaries.
                </p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs text-primary gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                Open <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div
              onClick={() => router.push("/dashboard/staff")}
              className="flex items-center justify-between p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-sm text-foreground group-hover:text-blue-600 transition-colors">
                    Staff & Team Management
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Manage staff profiles, role permissions, assigned cases, and field activity logs.
                </p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs text-blue-600 gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                Open <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div
              onClick={() => router.push("/dashboard/volunteers")}
              className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-sm text-foreground group-hover:text-emerald-600 transition-colors">
                    Volunteer & Campaign Management
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Register volunteers, track skills & availability, deploy campaigns, and log service hours.
                </p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs text-emerald-600 gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                Open <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
