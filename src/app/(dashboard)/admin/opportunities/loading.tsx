import { DashboardOverviewLoading } from "@/components/dashboard/DashboardOverviewLoading";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminWorkOpportunitiesLoading() {
  return (
    <div className="space-y-6">
      <DashboardOverviewLoading cardCount={3} />
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
