import type { Metadata } from "next";
import { AdminDashboardView } from "@/components/dashboard/AdminDashboardView";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Wujood Welfare administrative management portal.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardView />;
}
