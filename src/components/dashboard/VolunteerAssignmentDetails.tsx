"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, Check, CheckCircle2, Loader2, MapPin, Play, X } from "lucide-react";
import { toast } from "sonner";
import { updateVolunteerAssignment } from "@/actions/volunteer-work";
import { updateOpportunityParticipation } from "@/actions/work-opportunities";
import type { VolunteerAssignmentModel } from "@/generated/prisma/models/VolunteerAssignment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MOTION_DURATION_INTERACTION, MOTION_EASE } from "@/lib/motion";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Assignment = Pick<
  VolunteerAssignmentModel,
  | "id"
  | "title"
  | "description"
  | "location"
  | "status"
  | "priority"
  | "deadline"
  | "createdAt"
  | "volunteerNotes"
  | "opportunityId"
> & {
  opportunity: {
    status: string;
    date: Date | null;
    startTime: string | null;
    endTime: string | null;
  } | null;
};

export function VolunteerAssignmentDetails({
  assignment,
}: {
  assignment: Assignment;
}) {
  const router = useRouter();
  const [completionNotes, setCompletionNotes] = useState("");
  const [pendingStatus, setPendingStatus] = useState<
    "accepted" | "declined" | "in_progress" | "completed" | null
  >(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null);
  const pendingRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const pending = pendingStatus !== null;

  async function updateStatus(status: "accepted" | "declined" | "in_progress" | "completed") {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPendingStatus(status);
    setConfirmedMessage(null);
    try {
      const result = assignment.opportunityId
        ? await updateOpportunityParticipation(
            assignment.id,
            status === "declined" ? "declined" : status,
            completionNotes,
          )
        : await updateVolunteerAssignment({
            assignmentId: assignment.id,
            status,
            notes: completionNotes,
          });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setWithdrawOpen(false);
      const message =
        status === "accepted"
          ? "Assignment accepted."
          : status === "declined"
            ? "Assignment declined."
            : status === "in_progress"
              ? "Assignment marked as working."
              : "Work marked complete and sent to the organization.";
      setConfirmedMessage(message);
      toast.success(message);
      router.refresh();
    } catch (error) {
      console.error("Volunteer assignment transition failed:", error);
      toast.error("Could not update this assignment.");
    } finally {
      pendingRef.current = false;
      setPendingStatus(null);
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

      {confirmedMessage && (
        <motion.p
          key={confirmedMessage}
          role="status"
          aria-live="polite"
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION_DURATION_INTERACTION, ease: MOTION_EASE }}
          className="motion-entrance flex items-center gap-2 text-sm font-medium text-success"
        >
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: MOTION_DURATION_INTERACTION, ease: MOTION_EASE }}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </motion.span>
          {confirmedMessage}
        </motion.p>
      )}

      <article className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="border-b border-border bg-muted/30 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{statusLabel(assignment.status)}</Badge>
            <Badge variant="secondary">{assignment.priority} priority</Badge>
            {assignment.opportunity && assignment.opportunity.status !== "open" && (
              <Badge variant="outline" className="capitalize">
                Opportunity {assignment.opportunity.status}
              </Badge>
            )}
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
            {assignment.opportunity?.startTime && assignment.opportunity.endTime && (
              <span>
                {assignment.opportunity.startTime}–{assignment.opportunity.endTime}
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
                {pendingStatus === "accepted" ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <Check />
                )}
                {pendingStatus === "accepted" ? "Accepting..." : "Accept assignment"}
              </Button>
            </div>
          )}

          {assignment.status === "accepted" && (
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
              {assignment.opportunityId && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => setWithdrawOpen(true)}
                >
                  <X /> Withdraw position
                </Button>
              )}
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

      <AlertDialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw from this position?</AlertDialogTitle>
            <AlertDialogDescription>
              You can withdraw while your status is Accepted. Once you start
              working, the position cannot be withdrawn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Keep position</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => updateStatus("declined")}
            >
              {pendingStatus === "declined" ? "Withdrawing..." : "Withdraw"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function statusLabel(status: string) {
  if (status === "in_progress") return "Working";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
