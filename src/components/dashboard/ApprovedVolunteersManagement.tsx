"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  createVolunteerAssignment,
  type getAdminVolunteerManagement,
} from "@/actions/volunteers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Volunteer = Awaited<
  ReturnType<typeof getAdminVolunteerManagement>
>["volunteers"][number];

export function ApprovedVolunteersManagement({
  volunteers,
}: {
  volunteers: Volunteer[];
}) {
  const router = useRouter();
  const [assignmentVolunteer, setAssignmentVolunteer] = useState<Volunteer | null>(null);
  const [assignmentPending, setAssignmentPending] = useState(false);

  async function submitAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assignmentVolunteer?.account) return;

    const formData = new FormData(event.currentTarget);
    setAssignmentPending(true);
    try {
      const result = await createVolunteerAssignment({
        userId: assignmentVolunteer.account.id,
        title: formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location"),
        priority: formData.get("priority"),
        deadline: formData.get("deadline"),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Assignment created and added to the volunteer's workload.");
      setAssignmentVolunteer(null);
      router.refresh();
    } catch (error) {
      console.error("Volunteer assignment request failed:", error);
      toast.error("Could not create this assignment.");
    } finally {
      setAssignmentPending(false);
    }
  }

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Approved volunteers</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Accounts, current workload, and completed assignments.
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            {volunteers.length} approved
          </Badge>
        </div>

        {volunteers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Approved volunteer profiles will appear here.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {volunteers.map(({ application, account }) => {
              const assignments = account?.assignments ?? [];
              const currentAssignments = assignments.filter(
                (assignment) => !["completed", "declined"].includes(assignment.status),
              );
              const completedAssignments = assignments.filter(
                (assignment) => assignment.status === "completed",
              );

              return (
                <article
                  key={application.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{application.name}</h3>
                          <BadgeCheck className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" />{application.email}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" />{application.phone}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{application.city}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        !account
                          ? "w-fit border-amber-500/30 bg-amber-500/10 text-amber-700"
                          : account.banned
                            ? "w-fit border-destructive/30 bg-destructive/10 text-destructive"
                            : "w-fit border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                      }
                    >
                      {!account
                        ? "Account not created"
                        : account.banned
                          ? "Account disabled"
                          : "Account active"}
                    </Badge>
                  </div>

                  <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-muted px-2.5 py-1">
                          Skills: {application.skills || "Not provided"}
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-1">
                          Availability: {application.availability}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <BriefcaseBusiness className="h-4 w-4" />
                          {currentAssignments.length} current
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Check className="h-4 w-4" />
                          {completedAssignments.length} completed
                        </span>
                      </div>
                      {assignments.length > 0 && (
                        <div className="space-y-2 border-t border-border pt-3">
                          {assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex flex-wrap items-center justify-between gap-2 text-xs"
                            >
                              <span className="font-medium">{assignment.title}</span>
                              <span className="flex items-center gap-2 text-muted-foreground">
                                {assignment.deadline && (
                                  <span className="inline-flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" />
                                    {format(assignment.deadline, "MMM d, yyyy")}
                                  </span>
                                )}
                                <Badge variant="outline">{assignment.status}</Badge>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!account || account.role !== "volunteer" || Boolean(account.banned)}
                      onClick={() => setAssignmentVolunteer({ application, account })}
                    >
                      <BriefcaseBusiness /> Assign work
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Dialog
        open={Boolean(assignmentVolunteer)}
        onOpenChange={(open) => !open && setAssignmentVolunteer(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Assign work</DialogTitle>
            <DialogDescription>
              {assignmentVolunteer
                ? `Create a new assignment for ${assignmentVolunteer.application.name}. Assignment status starts as pending and is managed separately from application status.`
                : "Create a volunteer assignment."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitAssignment} className="space-y-4">
            <div>
              <label htmlFor="assignment-title" className="text-sm font-medium">Title</label>
              <Input id="assignment-title" name="title" required minLength={3} maxLength={120} className="mt-1.5" />
            </div>
            <div>
              <label htmlFor="assignment-description" className="text-sm font-medium">Description</label>
              <textarea
                id="assignment-description"
                name="description"
                required
                minLength={5}
                maxLength={3000}
                rows={4}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="assignment-location" className="text-sm font-medium">Location</label>
                <Input id="assignment-location" name="location" maxLength={160} className="mt-1.5" />
              </div>
              <div>
                <label htmlFor="assignment-priority" className="text-sm font-medium">Priority</label>
                <select
                  id="assignment-priority"
                  name="priority"
                  defaultValue="medium"
                  className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label htmlFor="assignment-deadline" className="text-sm font-medium">Deadline</label>
                <Input id="assignment-deadline" name="deadline" type="date" className="mt-1.5" />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setAssignmentVolunteer(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignmentPending}>
                <Clock3 /> {assignmentPending ? "Creating…" : "Create assignment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
