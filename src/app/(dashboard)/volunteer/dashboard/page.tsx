import type { Metadata } from "next";
import { VolunteerDashboardView } from "@/components/dashboard/VolunteerDashboardView";

export const metadata: Metadata = {
  title: "Volunteer Dashboard",
  description: "Wujood Welfare volunteer management and workspace.",
};

export default function VolunteerDashboardPage() {
  return <VolunteerDashboardView />;
}
