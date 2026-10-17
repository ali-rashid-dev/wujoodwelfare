import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  HandHeart,
  MapPin,
  UserRound,
  CheckCircle2,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VolunteerAssignmentModel } from "@/generated/prisma/models/VolunteerAssignment";

type Assignment = Pick<
  VolunteerAssignmentModel,
  "id" | "title" | "description" | "status" | "deadline" | "location" | "createdAt"
>;

type AvailableOpportunity = {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  date: Date | null;
  timeCommitment: string | null;
  remainingPositions: number;
};

export function VolunteerDashboardView({
  assignments,
  availableOpportunities,
  volunteerName,
  stats,
}: {
  assignments: Assignment[];
  availableOpportunities: AvailableOpportunity[];
  volunteerName: string;
  stats: {
    pendingResponses: number;
    acceptedAssignments: number;
    currentWork: number;
    completedAssignments: number;
  };
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-5 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-primary">
            <HandHeart className="h-3.5 w-3.5" />
            Volunteer Community Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome, {volunteerName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Review new assignments, track your work, and keep your volunteer
            profile up to date.
          </p>
        </div>
        <Button render={<Link href="/volunteer/opportunities" />}>
          Find available work <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <section aria-labelledby="available-opportunities-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="available-opportunities-heading" className="text-lg font-bold">
              Available opportunities
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Open roles with positions still available.
            </p>
          </div>
          <Link
            href="/volunteer/opportunities"
            className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md px-2 text-sm font-semibold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {availableOpportunities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
            <BriefcaseBusiness className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-2 text-sm font-semibold">No open opportunities right now</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back later for new volunteer work.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {availableOpportunities.map((opportunity) => (
              <Link
                key={opportunity.id}
                href="/volunteer/opportunities"
                className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-4 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Badge variant="secondary" className="mb-3 self-start">
                  {opportunity.category}
                </Badge>
                <h3 className="font-semibold leading-snug">{opportunity.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {opportunity.description}
                </p>
                <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    {opportunity.date
                      ? format(opportunity.date, "MMM d, yyyy")
                      : "Date to be announced"}
                    {opportunity.timeCommitment && ` · ${opportunity.timeCommitment}`}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{opportunity.location}</span>
                  </p>
                </div>
                <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <UsersRound className="h-4 w-4" />
                  {opportunity.remainingPositions}{" "}
                  {opportunity.remainingPositions === 1 ? "position" : "positions"} available
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Pending responses" value={stats.pendingResponses} icon={Clock3} href="/volunteer/assignments?view=available" />
        <SummaryCard label="Accepted assignments" value={stats.acceptedAssignments} icon={CheckCircle2} href="/volunteer/assignments?view=active" />
        <SummaryCard label="Current work" value={stats.currentWork} icon={BriefcaseBusiness} href="/volunteer/assignments?view=active" />
        <SummaryCard label="Completed assignments" value={stats.completedAssignments} icon={Check} href="/volunteer/assignments?view=completed" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Recent work</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your latest work and deadlines.</p>
          </div>
          <Link
            href="/volunteer/assignments"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            My Work <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {assignments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <BriefcaseBusiness className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-semibold">No assignments yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New work assigned by the organization will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {assignments.slice(0, 6).map((assignment) => (
              <Link
                key={assignment.id}
                href={`/volunteer/assignments/${assignment.id}`}
                className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{assignment.title}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {assignment.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant="outline">
                    {assignment.status === "in_progress"
                      ? "Working"
                      : assignment.status.replaceAll("_", " ")}
                  </Badge>
                  {assignment.deadline && (
                    <span className="text-xs text-muted-foreground">
                      Due {format(assignment.deadline, "MMM d")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Link
        href="/volunteer/profile"
        className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Keep your profile current</p>
            <p className="text-xs text-muted-foreground">Update your contact details and skills.</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: number;
  icon: typeof Clock3;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-border bg-card p-5 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </Link>
  );
}
