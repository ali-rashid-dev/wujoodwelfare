"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  createVolunteerAssignment,
  type getAdminVolunteerManagement,
} from "@/actions/volunteers";
import { changeManagedUserStatus } from "@/actions/user-management";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

type VolunteerFilter = "all" | "active" | "deactivated" | "needs_account";

function isAccountActive(account: NonNullable<Volunteer["account"]>) {
  return account.banned !== true ||
    (account.banExpires !== null && account.banExpires <= new Date());
}

export function ApprovedVolunteersManagement({
  volunteers,
}: {
  volunteers: Volunteer[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<VolunteerFilter>("all");
  const [detailsVolunteer, setDetailsVolunteer] = useState<Volunteer | null>(null);
  const [assignmentVolunteer, setAssignmentVolunteer] = useState<Volunteer | null>(null);
  const [statusVolunteer, setStatusVolunteer] = useState<Volunteer | null>(null);
  const [assignmentPending, setAssignmentPending] = useState(false);
  const [statusPending, setStatusPending] = useState(false);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredVolunteers = useMemo(
    () =>
      volunteers.filter(({ application, account }) => {
        const active = account ? isAccountActive(account) : false;
        const matchesFilter =
          filter === "all" ||
          (filter === "needs_account" && !account) ||
          (filter === "active" && Boolean(account) && active) ||
          (filter === "deactivated" && Boolean(account) && !active);
        const matchesQuery =
          !normalizedQuery ||
          [
            application.name,
            application.email,
            application.phone,
            application.city,
            application.skills,
            application.qualification,
          ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
        return matchesFilter && matchesQuery;
      }),
    [filter, normalizedQuery, volunteers],
  );

  const activeCount = volunteers.filter(
    ({ account }) => account && isAccountActive(account),
  ).length;
  const deactivatedCount = volunteers.filter(
    ({ account }) => account && !isAccountActive(account),
  ).length;
  const currentAssignmentCount = volunteers.reduce(
    (count, { account }) =>
      count +
      (account?.assignments.filter(
        (assignment) => !["completed", "declined"].includes(assignment.status),
      ).length ?? 0),
    0,
  );

  async function changeVolunteerStatus() {
    if (!statusVolunteer?.account) return;
    const nextStatus = isAccountActive(statusVolunteer.account) ? "deactivated" : "active";
    setStatusPending(true);
    try {
      const result = await changeManagedUserStatus(statusVolunteer.account.id, nextStatus);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.changed
          ? nextStatus === "active"
            ? "Volunteer account activated."
            : "Volunteer account deactivated and active sessions revoked."
          : `Volunteer account is already ${nextStatus}.`,
      );
      setStatusVolunteer(null);
      setDetailsVolunteer(null);
      router.refresh();
    } catch (error) {
      console.error("Approved volunteer account status request failed:", error);
      toast.error("Could not update this volunteer account.");
    } finally {
      setStatusPending(false);
    }
  }

  async function submitAssignment(event: FormEvent<HTMLFormElement>) {
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
      <section className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Approved volunteers", value: volunteers.length, icon: Users, color: "text-primary" },
            { label: "Active accounts", value: activeCount, icon: UserCheck, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Current assignments", value: currentAssignmentCount, icon: BriefcaseBusiness, color: "text-blue-600 dark:text-blue-400" },
            { label: "Deactivated accounts", value: deactivatedCount, icon: ShieldCheck, color: "text-destructive" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Volunteer directory</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review profiles, manage portal access, and keep volunteer work moving.
              </p>
            </div>
            <Badge variant="outline" className="w-fit">
              Showing {filteredVolunteers.length} of {volunteers.length}
            </Badge>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, phone, city, skills"
                aria-label="Search approved volunteers"
                className="pl-9"
              />
            </div>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as VolunteerFilter)}
              aria-label="Filter volunteers by account status"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="all">All approved volunteers</option>
              <option value="active">Active accounts</option>
              <option value="deactivated">Deactivated accounts</option>
              <option value="needs_account">Account not created</option>
            </select>
          </div>

          {filteredVolunteers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="font-medium">
                {volunteers.length === 0
                  ? "No approved volunteers yet"
                  : "No volunteers match these filters"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {volunteers.length === 0
                  ? "Approved volunteer profiles will appear here."
                  : "Try another search term or account status."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="divide-y divide-border">
                {filteredVolunteers.map(({ application, account }) => {
                  const assignments = account?.assignments ?? [];
                  const currentAssignments = assignments.filter(
                    (assignment) => !["completed", "declined"].includes(assignment.status),
                  );
                  const completedAssignments = assignments.filter(
                    (assignment) => assignment.status === "completed",
                  );
                  const active = account ? isAccountActive(account) : false;

                  return (
                    <article
                      key={application.id}
                      className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="flex min-w-0 gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{application.name}</h3>
                            <BadgeCheck className="h-4 w-4 text-emerald-600" />
                            <Badge
                              variant="outline"
                              className={
                                !account
                                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
                                  : active
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                    : "border-destructive/30 bg-destructive/10 text-destructive"
                              }
                            >
                              {!account ? "Account not created" : active ? "Active" : "Deactivated"}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{application.email}</span>
                            <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{application.phone}</span>
                            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{application.city}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{application.skills || "No skills listed"}</span>
                            <span aria-hidden="true">·</span>
                            <span>{currentAssignments.length} current</span>
                            <span aria-hidden="true">·</span>
                            <span>{completedAssignments.length} completed</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailsVolunteer({ application, account })}
                        >
                          <FileText /> View profile
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={!account || account.role !== "volunteer" || !active}
                          onClick={() => setAssignmentVolunteer({ application, account })}
                        >
                          <BriefcaseBusiness /> Assign work
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={Boolean(detailsVolunteer)}
        onOpenChange={(open) => !open && setDetailsVolunteer(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          {detailsVolunteer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-primary" />
                  {detailsVolunteer.application.name}
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                </DialogTitle>
                <DialogDescription>
                  Application submitted {format(detailsVolunteer.application.createdAt, "PPP")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <section className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
                  <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{detailsVolunteer.application.email}</p>
                  <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{detailsVolunteer.application.phone}</p>
                  <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{detailsVolunteer.application.city}</p>
                  <p className="flex items-center gap-2 text-sm"><UserRound className="h-4 w-4 text-muted-foreground" />{detailsVolunteer.application.gender}</p>
                  <p className="text-sm"><span className="font-medium">Father/guardian:</span> {detailsVolunteer.application.fatherName || "Not provided"}</p>
                  <p className="text-sm"><span className="font-medium">Qualification:</span> {detailsVolunteer.application.qualification || "Not provided"}</p>
                  <p className="text-sm"><span className="font-medium">Availability:</span> {detailsVolunteer.application.availability}</p>
                  <p className="text-sm"><span className="font-medium">Skills:</span> {detailsVolunteer.application.skills || "Not provided"}</p>
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium">Statement of purpose</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                      {detailsVolunteer.application.statementOfPurpose || "Not provided"}
                    </p>
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">Assignments</h3>
                    <Badge variant="outline">
                      {detailsVolunteer.account?.assignments.length ?? 0} total
                    </Badge>
                  </div>
                  {!detailsVolunteer.account?.assignments.length ? (
                    <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                      No assignments have been given to this volunteer.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {detailsVolunteer.account.assignments.map((assignment) => (
                        <div key={assignment.id} className="rounded-xl border border-border p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium">{assignment.title}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{assignment.priority}</Badge>
                              <Badge variant="outline">{assignment.status.replaceAll("_", " ")}</Badge>
                            </div>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                            {assignment.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {assignment.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{assignment.location}</span>}
                            {assignment.deadline && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />Due {format(assignment.deadline, "PPP")}</span>}
                            <span>Created {format(assignment.createdAt, "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
                  {detailsVolunteer.account ? (
                    <Button
                      type="button"
                      variant={isAccountActive(detailsVolunteer.account) ? "destructive" : "outline"}
                      disabled={statusPending}
                      onClick={() => setStatusVolunteer(detailsVolunteer)}
                    >
                      <ShieldCheck />
                      {isAccountActive(detailsVolunteer.account) ? "Deactivate account" : "Activate account"}
                    </Button>
                  ) : <span />}
                  <Button
                    type="button"
                    disabled={!detailsVolunteer.account || detailsVolunteer.account.role !== "volunteer" || !isAccountActive(detailsVolunteer.account)}
                    onClick={() => {
                      setAssignmentVolunteer(detailsVolunteer);
                      setDetailsVolunteer(null);
                    }}
                  >
                    <BriefcaseBusiness /> Assign work
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(statusVolunteer)}
        onOpenChange={(open) => !open && !statusPending && setStatusVolunteer(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusVolunteer?.account && isAccountActive(statusVolunteer.account)
                ? "Deactivate volunteer account?"
                : "Activate volunteer account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusVolunteer?.account && isAccountActive(statusVolunteer.account)
                ? `This will revoke ${statusVolunteer.application.name}'s active sessions and prevent portal access. The approved profile and assignment history will be retained.`
                : `This will restore ${statusVolunteer?.application.name}'s access to the volunteer portal.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={statusPending} onClick={changeVolunteerStatus}>
              {statusPending ? "Updating…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
