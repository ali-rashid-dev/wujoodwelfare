import { DashboardOverviewLoading } from "@/components/dashboard/DashboardOverviewLoading";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6">
      <DashboardOverviewLoading cardCount={4} />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
