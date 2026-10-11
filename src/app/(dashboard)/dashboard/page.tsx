import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { DashboardRoleView } from "@/components/dashboard/DashboardRoleView";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Wujood Welfare role-based management portal.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <DashboardRoleView />;
}
