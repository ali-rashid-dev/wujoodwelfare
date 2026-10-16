import type { Metadata } from "next";
import { getAdminWorkOpportunities } from "@/actions/work-opportunities";
import { WorkOpportunitiesManagement } from "@/components/dashboard/admin/WorkOpportunitiesManagement";

export const metadata: Metadata = {
  title: "Work Opportunities",
  description: "Create and manage shared volunteer work opportunities.",
};

export default async function AdminWorkOpportunitiesPage() {
  const opportunities = await getAdminWorkOpportunities();
  return <WorkOpportunitiesManagement opportunities={opportunities} />;
}
