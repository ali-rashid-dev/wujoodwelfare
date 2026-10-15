"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createVolunteerAssignment,
  updateVolunteerApplicationStatus,
} from "@/actions/volunteers";
import type { getAdminVolunteerManagement } from "@/actions/volunteers";
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

type VolunteerManagementData = Awaited<
  ReturnType<typeof getAdminVolunteerManagement>
>;
type Application = VolunteerManagementData["applications"][number];
type Volunteer = VolunteerManagementData["volunteers"][number];

const applicationStatusStyles: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "border-destructive/30 bg-destructive/10 text-destructive",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={applicationStatusStyles[status] ?? "border-border"}
    >
      {status.replaceAll("_", " ")}
    </Badge>
  );
}

export function VolunteerManagement({
  initialData,
}: {
  initialData: VolunteerManagementData;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [assignmentVolunteer, setAssignmentVolunteer] = useState<Volunteer | null>(null);
  const [pendingApplicationId, setPendingApplicationId] = useState<string | null>(null);
  const [assignmentPending, setAssignmentPending] = useState(false);

  const search = query.trim().toLocaleLowerCase();
  const applications = useMemo(
    () =>
      initialData.applications.filter((application) => {
        const matchesStatus = filter === "all" || application.status === filter;
        const matchesSearch =
          !search ||
          [
            application.name,
            application.email,
            application.phone,
            application.city,
            application.skills,
          ].some((value) => value.toLocaleLowerCase().includes(search));
        return matchesStatus && matchesSearch;
      }),
    [filter, initialData.applications, search],
  );

  const pendingCount = initialData.applications.filter(
    (application) => application.status === "pending",
  ).length;

  async function reviewApplication(
    application: Application,
    status: "approved" | "rejected",
  ) {
    setPendingApplicationId(application.id);
    try {
      const result = await updateVolunteerApplicationStatus(application.id, status);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        status === "approved"
          ? "Application approved. Volunteer access is now enabled for this account."
          : "Application rejected.",
      );
      setSelectedApplication(null);
      router.refresh();
    } catch (error) {
      console.error("Volunteer review request failed:", error);
      toast.error("Could not update this application.");
    } finally {
      setPendingApplicationId(null);
    }
  }

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
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Applications</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review applicant details before granting volunteer portal access.
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            {pendingCount} pending review
          </Badge>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search applicants by name, email, phone or city"
              className="pl-9"
            />
          </div>
          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as typeof filter)
            }
            aria-label="Filter applications by status"
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No volunteer applications match these filters.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="divide-y divide-border">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{application.name}</h3>
                      <StatusBadge status={application.status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {application.email} · {application.city}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Applied {format(application.createdAt, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <Eye /> Details
                    </Button>
                    {application.status === "pending" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          disabled={pendingApplicationId === application.id}
                          onClick={() => reviewApplication(application, "approved")}
                        >
                          <Check /> Approve
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={pendingApplicationId === application.id}
                          onClick={() => reviewApplication(application, "rejected")}
                        >
                          <X /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Approved volunteers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Accounts, current workload, and completed assignments.
          </p>
        </div>

        {initialData.volunteers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Approved volunteer profiles will appear here.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {initialData.volunteers.map(({ application, account }) => {
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
                          <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{application.email}</span>
                          <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{application.phone}</span>
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{application.city}</span>
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
                      {!account ? "Account not created" : account.banned ? "Account disabled" : "Account active"}
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
                                <StatusBadge status={assignment.status} />
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
        open={Boolean(selectedApplication)}
        onOpenChange={(open) => !open && setSelectedApplication(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle>Volunteer application</DialogTitle>
                <DialogDescription>
                  Submitted {format(selectedApplication.createdAt, "PPP")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2 sm:grid-cols-2">
                <Detail label="Full name" value={selectedApplication.name} />
                <Detail label="Father name" value={selectedApplication.fatherName || "—"} />
                <Detail label="Email" value={selectedApplication.email} />
                <Detail label="Phone" value={selectedApplication.phone} />
                <Detail label="City" value={selectedApplication.city} />
                <Detail label="Qualification" value={selectedApplication.qualification} />
                <Detail label="Gender" value={selectedApplication.gender} />
                <Detail label="Availability" value={selectedApplication.availability} />
                <Detail label="Skills and interests" value={selectedApplication.skills || "Not provided"} />
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground">Statement of purpose</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedApplication.statementOfPurpose || "Not provided"}
                  </p>
                </div>
              </div>
              {selectedApplication.status === "pending" && (
                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pendingApplicationId === selectedApplication.id}
                    onClick={() => reviewApplication(selectedApplication, "rejected")}
                  >
                    <X /> Reject
                  </Button>
                  <Button
                    type="button"
                    disabled={pendingApplicationId === selectedApplication.id}
                    onClick={() => reviewApplication(selectedApplication, "approved")}
                  >
                    <Check /> Approve application
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

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
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm">{value}</p>
    </div>
  );
}
