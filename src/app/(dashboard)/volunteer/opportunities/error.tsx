"use client";

import { DashboardOverviewError } from "@/components/dashboard/DashboardOverviewError";

export default function VolunteerWorkOpportunitiesError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <DashboardOverviewError error={error} retry={unstable_retry} />;
}
