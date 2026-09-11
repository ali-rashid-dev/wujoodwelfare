"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Mail, LogOut, Loader2, ShieldCheck } from "lucide-react";

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
      <SiteLayout>
        <section className="section-y container-x flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-sm font-medium">Verifying session...</p>
        </section>
      </SiteLayout>
    );
  }

  if (!session?.user) {
    return (
      <SiteLayout>
        <section className="section-y container-x flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground text-sm font-medium">Redirecting to Sign In...</p>
        </section>
      </SiteLayout>
    );
  }

  const { user } = session;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="User Area"
        title="Dashboard"
        subtitle={`Welcome back, ${user.name || "Member"}!`}
      />
      <section className="section-y container-x">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-blue text-primary-foreground font-bold text-2xl shadow-blue">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{user.name || "User"}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" /> Authenticated
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Mail className="h-4 w-4" /> {user.email}
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                await signOut();
                router.push("/sign-in");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>

          {/* Activity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Status</span>
              <p className="mt-2 text-2xl font-bold text-primary">Active Member</p>
              <p className="text-xs text-muted-foreground mt-1">Verified via Better Auth</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Impact Contributions</span>
              <p className="mt-2 text-2xl font-bold text-foreground">0 Donations</p>
              <p className="text-xs text-muted-foreground mt-1">No recorded donations yet</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Volunteer Status</span>
              <p className="mt-2 text-2xl font-bold text-foreground">Registered</p>
              <p className="text-xs text-muted-foreground mt-1">Ready for community drives</p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
