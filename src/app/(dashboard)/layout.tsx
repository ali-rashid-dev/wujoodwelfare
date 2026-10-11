import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RoleProvider } from "@/context/RoleContext";

export const metadata: Metadata = {
  title: {
    template: "%s | Wujood Welfare",
    default: "Dashboard | Wujood Welfare",
  },
  description: "Role-based management portal for administrators and volunteers.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbRole = (user.role as "admin" | "volunteer") || "volunteer";

  return (
    <RoleProvider initialRole={dbRole}>
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex min-h-screen w-full bg-background text-foreground antialiased">
          <AppSidebar user={user} />
          <SidebarInset className="flex flex-1 flex-col min-w-0 bg-muted/15">
            <DashboardHeader user={user} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </RoleProvider>
  );
}
