import { Skeleton } from "@/components/ui/skeleton";

export function DashboardOverviewLoading({
  cardCount,
}: {
  cardCount: number;
}) {
  return (
    <section aria-label="Loading dashboard overview" aria-busy="true">
      <Skeleton className="mb-4 h-4 w-28" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: cardCount }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-4 h-8 w-1/3" />
          </div>
        ))}
      </div>
    </section>
  );
}
