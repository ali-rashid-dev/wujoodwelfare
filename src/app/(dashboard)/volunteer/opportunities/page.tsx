import type { Metadata } from "next";
import { getVolunteerWorkOpportunities } from "@/actions/work-opportunities";
import { VolunteerWorkOpportunities } from "@/components/dashboard/VolunteerWorkOpportunities";

export const metadata: Metadata = {
  title: "Work Opportunities",
  description: "Find shared volunteer work opportunities and claim an open position.",
};

export default async function VolunteerWorkOpportunitiesPage() {
  const opportunities = await getVolunteerWorkOpportunities();
  return <VolunteerWorkOpportunities opportunities={opportunities} />;
}
