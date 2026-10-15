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
        { email: { equals: user.email, mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });

  if (!approvedApplication) {
    redirect("/volunteer/status");
  }

  return (
    <RoleProvider key={user.id} userId={user.id} role="volunteer">
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex min-h-screen w-full bg-background text-foreground antialiased">
          <AppSidebar user={user} role="volunteer" />
          <SidebarInset className="flex flex-1 flex-col min-w-0 bg-muted/15">
            <DashboardHeader role="volunteer" />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </RoleProvider>
  );
}
