import { Skeleton } from "@/components/ui/skeleton";

export default function VolunteerWorkOpportunitiesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-36 rounded-3xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
