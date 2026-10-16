"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function DashboardOverviewError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard overview failed to load:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6"
    >
      <h1 className="text-lg font-semibold">Dashboard overview unavailable</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn&apos;t load the latest dashboard data. Please try again.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}
      <Button className="mt-4" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
