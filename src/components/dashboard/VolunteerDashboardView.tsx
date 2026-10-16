import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Clock3,
  HandHeart,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VolunteerAssignmentModel } from "@/generated/prisma/models/VolunteerAssignment";

type Assignment = Pick<
  VolunteerAssignmentModel,
  "id" | "title" | "description" | "status" | "deadline" | "location" | "createdAt"
>;

export function VolunteerDashboardView({
  assignments,
  volunteerName,
}: {
  assignments: Assignment[];
  volunteerName: string;
}) {
  const pending = assignments.filter((item) => item.status === "pending").length;
  const active = assignments.filter((item) =>
    ["accepted", "in_progress"].includes(item.status),
  ).length;
  const completed = assignments.filter((item) => item.status === "completed").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-linear-to-r from-emerald-500/15 via-emerald-500/5 to-transparent p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
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

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Awaiting response" value={pending} icon={Clock3} href="/volunteer/assignments?view=available" />
        <SummaryCard label="In progress" value={active} icon={BriefcaseBusiness} href="/volunteer/assignments" />
        <SummaryCard label="Completed" value={completed} icon={Check} href="/volunteer/assignments?view=completed" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Recent assignments</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your latest assigned work and deadlines.</p>
          </div>
          <Link
            href="/volunteer/assignments"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            All assignments <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <BriefcaseBusiness className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-semibold">No assignments yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New work assigned by the organization will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
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
                  <Badge variant="outline">{assignment.status.replaceAll("_", " ")}</Badge>
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
        className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/30 p-5 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
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
    <Link href={href} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </Link>
  );
}
