import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: {
    template: "%s | Wujood Welfare Console",
    default: "Dashboard | Wujood Welfare",
  },
  description: "Wujood Welfare Administrative Console and Beneficiary Database",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {/* App Sidebar Navigation */}
        <AppSidebar />

        {/* Main Console Content Shell */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Dashboard Header Bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 md:px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="text-foreground font-semibold">Console</span>
              <span>/</span>
              <span>Welfare Portal</span>
            </div>
          </header>

          {/* Main Dashboard Pages Area with Optimized Padding */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
