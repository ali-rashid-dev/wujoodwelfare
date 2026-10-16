"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, Check, MapPin, Play, X } from "lucide-react";
import { toast } from "sonner";
import { updateVolunteerAssignment } from "@/actions/volunteer-work";
import type { VolunteerAssignmentModel } from "@/generated/prisma/models/VolunteerAssignment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Assignment = Pick<
  VolunteerAssignmentModel,
  "id" | "title" | "description" | "location" | "status" | "priority" | "deadline" | "createdAt" | "volunteerNotes"
>;

export function VolunteerAssignmentDetails({
  assignment,
}: {
  assignment: Assignment;
}) {
  const router = useRouter();
  const [completionNotes, setCompletionNotes] = useState("");
  const [pending, setPending] = useState(false);

  async function updateStatus(status: "accepted" | "declined" | "in_progress" | "completed") {
    setPending(true);
    try {
      const result = await updateVolunteerAssignment({
        assignmentId: assignment.id,
        status,
        notes: completionNotes,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        status === "accepted"
          ? "Assignment accepted."
          : status === "declined"
            ? "Assignment declined."
            : status === "in_progress"
              ? "Assignment marked as working."
              : "Work marked complete and sent to the organization.",
      );
      router.refresh();
    } catch (error) {
      console.error("Volunteer assignment transition failed:", error);
      toast.error("Could not update this assignment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/volunteer/assignments"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to assignments
      </Link>

      <article className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="border-b border-border bg-muted/30 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{assignment.status.replaceAll("_", " ")}</Badge>
            <Badge variant="secondary">{assignment.priority} priority</Badge>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            {assignment.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {assignment.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {assignment.location}
              </span>
            )}
            {assignment.deadline && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Due {format(assignment.deadline, "PPP")}
              </span>
            )}
            <span>Assigned {format(assignment.createdAt, "PPP")}</span>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Instructions
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
              {assignment.description}
            </p>
          </section>

          {assignment.status === "completed" && assignment.volunteerNotes && (
            <section className="rounded-xl bg-muted/40 p-4">
              <h2 className="text-sm font-semibold">Completion notes</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {assignment.volunteerNotes}
              </p>
            </section>
          )}

          {assignment.status === "pending" && (
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                onClick={() => updateStatus("declined")}
              >
                <X /> Reject assignment
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={() => updateStatus("accepted")}
              >
                <Check /> Accept assignment
              </Button>
            </div>
          )}

          {assignment.status === "accepted" && (
            <div className="flex justify-end border-t border-border pt-5">
              <Button
                type="button"
                disabled={pending}
                onClick={() => updateStatus("in_progress")}
              >
                <Play /> Start working
              </Button>
            </div>
          )}

          {assignment.status === "in_progress" && (
            <div className="space-y-3 border-t border-border pt-5">
              <div>
                <label htmlFor="completion-notes" className="text-sm font-semibold">
                  Completion notes <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <Textarea
                  id="completion-notes"
                  value={completionNotes}
                  onChange={(event) => setCompletionNotes(event.target.value)}
                  maxLength={3000}
                  rows={4}
                  placeholder="Summarize the work you completed or share anything the coordinator should know."
                  className="mt-2"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={pending}
                  onClick={() => updateStatus("completed")}
                >
                  <Check /> Mark work complete
                </Button>
              </div>
            </div>
          )}

          {assignment.status === "declined" && (
            <p className="border-t border-border pt-5 text-sm text-muted-foreground">
              You declined this assignment. It cannot be started or completed.
            </p>
          )}

          {assignment.status === "completed" && (
            <p className="border-t border-border pt-5 text-sm text-emerald-700 dark:text-emerald-400">
              Work marked complete. The organization has received your completion report.
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
