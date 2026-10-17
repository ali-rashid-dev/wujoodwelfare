import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RoleProvider } from "@/context/RoleContext";

export const metadata: Metadata = {
  title: {
    template: "%s | Volunteer Portal",
    default: "Volunteer Portal | Wujood Welfare",
  },
  description: "Field volunteer workspace and community portal.",
};

export default async function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (user.banned) {
    redirect("/volunteer/status");
  }

  if (user.role !== "volunteer") {
    redirect("/volunteer/status");
  }

  const approvedApplication = await prisma.volunteerApplication.findFirst({
    where: {
      status: "approved",
      OR: [
        { userId: user.id },
        ...(user.emailVerified
          ? [{ userId: null, email: { equals: user.email, mode: "insensitive" as const } }]
          : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  if (!approvedApplication) {
    redirect("/volunteer/status");
  }

  return (
    <RoleProvider key={user.id} userId={user.id} role="volunteer">
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex min-h-screen w-full bg-background text-foreground antialiased">
          <a
            href="#dashboard-content"
            className="sr-only rounded-lg bg-card px-4 py-2 font-semibold text-foreground shadow-md focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:ring-2 focus:ring-ring"
          >
            Skip to main content
          </a>
          <AppSidebar user={{ ...user, name: approvedApplication.name }} role="volunteer" />
          <SidebarInset className="flex flex-1 flex-col min-w-0 bg-muted/15">
            <DashboardHeader role="volunteer" />
            <main id="dashboard-content" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </RoleProvider>
  );
}
