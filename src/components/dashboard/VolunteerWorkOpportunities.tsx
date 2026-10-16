"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { BriefcaseBusiness, CalendarDays, Check, Clock3, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import {
  acceptWorkOpportunity,
  type getVolunteerWorkOpportunities,
} from "@/actions/work-opportunities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type VolunteerOpportunities = Awaited<
  ReturnType<typeof getVolunteerWorkOpportunities>
>;
type Opportunity = VolunteerOpportunities[number];

const statusStyles: Record<string, string> = {
  open: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  closed: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
  completed: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

export function VolunteerWorkOpportunities({
  opportunities,
}: {
  opportunities: VolunteerOpportunities;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function acceptOpportunity(opportunity: Opportunity) {
    setPendingId(opportunity.id);
    try {
      const result = await acceptWorkOpportunity(opportunity.id);
      if (!result.success) {
        toast.error(result.error);
        router.refresh();
        return;
      }
      toast.success("Position accepted. Find this work in My Work.");
      router.refresh();
    } catch (error) {
      console.error("Opportunity acceptance request failed:", error);
      toast.error("Could not accept this opportunity.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-linear-to-r from-emerald-500/15 via-emerald-500/5 to-transparent p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <BriefcaseBusiness className="h-3.5 w-3.5" />
          Volunteer Community Portal
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Work Opportunities</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Explore published work, claim an available position, then update your progress in My Work.
            </p>
          </div>
          <Button variant="outline" nativeButton={false} render={<Link href="/volunteer/assignments" />}>
            <BriefcaseBusiness /> My Work
          </Button>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <BriefcaseBusiness className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">No published opportunities</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            New work will appear here when the organization publishes it.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2" aria-label="Published work opportunities">
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              pending={pendingId === opportunity.id}
              onAccept={() => acceptOpportunity(opportunity)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function OpportunityCard({
  opportunity,
  pending,
  onAccept,
}: {
  opportunity: Opportunity;
  pending: boolean;
  onAccept: () => void;
}) {
  const participationStatus = opportunity.participation?.status;
  const alreadyParticipated = Boolean(opportunity.participation);
  const displayedStatus =
    opportunity.status === "open" && opportunity.full ? "full" : opportunity.status;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex-1 space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge variant="outline" className="mb-2">{opportunity.category}</Badge>
            <h2 className="text-lg font-semibold">{opportunity.title}</h2>
          </div>
          <Badge
            variant="outline"
            className={statusStyles[opportunity.status] ?? "border-border"}
          >
            {displayedStatus === "full" ? "Full" : opportunity.status}
          </Badge>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {opportunity.description}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {opportunity.location}
          </span>
          {opportunity.date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {format(opportunity.date, "MMM d, yyyy")}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {opportunity.startTime && opportunity.endTime
              ? `${opportunity.startTime}–${opportunity.endTime}`
              : opportunity.timeCommitment}
          </span>
        </div>

        <div className="rounded-xl bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-2 font-medium">
              <Users className="h-4 w-4 text-primary" />
              {opportunity.acceptedCount} / {opportunity.spotsNeeded} positions
            </span>
            <span className="text-xs text-muted-foreground">
              {opportunity.status === "open"
                ? opportunity.full
                  ? "No positions left"
                  : `${opportunity.remainingPositions} remaining`
                : opportunity.status}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(
                  (opportunity.acceptedCount / Math.max(opportunity.spotsNeeded, 1)) * 100,
                  100,
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/10 px-5 py-3">
        {participationStatus ? (
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <Check className="h-4 w-4 text-emerald-600" />
            {participationStatus === "declined"
              ? "You withdrew from this opportunity"
              : `Your status: ${participationStatus === "in_progress" ? "Working" : participationStatus}`}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Claim a position to add this work to My Work.
          </span>
        )}
        {alreadyParticipated ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/volunteer/assignments" />}
          >
            View My Work
          </Button>
        ) : opportunity.status === "open" && !opportunity.full ? (
          <Button size="sm" onClick={onAccept} disabled={pending}>
            {pending ? "Claiming..." : "Accept position"}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
