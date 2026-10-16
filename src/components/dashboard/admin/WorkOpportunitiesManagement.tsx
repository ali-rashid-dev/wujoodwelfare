"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createWorkOpportunity,
  setWorkOpportunityStatus,
  updateWorkOpportunity,
  type getAdminWorkOpportunities,
} from "@/actions/work-opportunities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Opportunities = Awaited<ReturnType<typeof getAdminWorkOpportunities>>;
type Opportunity = Opportunities[number];
type OpportunityStatus = "open" | "closed" | "cancelled" | "completed";

const statusStyles: Record<string, string> = {
  draft: "border-border bg-muted text-muted-foreground",
  open: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  closed: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
  completed: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

export function WorkOpportunitiesManagement({
  opportunities,
}: {
  opportunities: Opportunities;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Opportunity | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    opportunity: Opportunity;
    status: OpportunityStatus;
  } | null>(null);
  const [pending, setPending] = useState(false);

  async function saveOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setPending(true);
    try {
      const input = {
        title: values.get("title"),
        category: values.get("category"),
        description: values.get("description"),
        location: values.get("location"),
        date: values.get("date"),
        startTime: values.get("startTime"),
        endTime: values.get("endTime"),
        spotsNeeded: values.get("spotsNeeded"),
        publish: values.get("publish") === "on",
      };
      const result = editTarget
        ? await updateWorkOpportunity({ ...input, id: editTarget.id })
        : await createWorkOpportunity(input);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setFormOpen(false);
      setEditTarget(null);
      toast.success(editTarget ? "Opportunity updated." : "Opportunity created.");
      router.refresh();
    } catch (error) {
      console.error("Work opportunity save request failed:", error);
      toast.error("Could not save this opportunity.");
    } finally {
      setPending(false);
    }
  }

  async function changeStatus() {
    if (!statusTarget) return;
    setPending(true);
    try {
      const result = await setWorkOpportunityStatus(
        statusTarget.opportunity.id,
        statusTarget.status,
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Opportunity ${statusTarget.status}.`);
      setStatusTarget(null);
      router.refresh();
    } catch (error) {
      console.error("Work opportunity status request failed:", error);
      toast.error("Could not update opportunity status.");
    } finally {
      setPending(false);
    }
  }

  const openCount = opportunities.filter((item) => item.status === "open").length;
  const publishedCount = opportunities.filter((item) => item.status !== "draft").length;
  const volunteerCount = opportunities.reduce((sum, item) => sum + item.acceptedCount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <BriefcaseBusiness className="h-3.5 w-3.5" />
          Administrative Console
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Work Opportunities</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Publish volunteer opportunities with a shared position limit. Approved volunteers can claim available positions themselves.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            <Plus /> Create opportunity
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Summary label="All opportunities" value={opportunities.length} icon={BriefcaseBusiness} />
        <Summary label="Published / active" value={openCount} icon={Check} />
        <Summary label="Volunteer positions claimed" value={volunteerCount} icon={Users} />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Manage opportunities</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {publishedCount} published opportunities · Accepted volunteers and work statuses appear below.
          </p>
        </div>

        {opportunities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <BriefcaseBusiness className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-semibold">No work opportunities yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create an opportunity to let approved volunteers sign up.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {opportunities.map((opportunity) => (
              <article
                key={opportunity.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Badge variant="outline" className={statusStyles[opportunity.status] ?? statusStyles.draft}>
                        {opportunity.status}
                      </Badge>
                      <h3 className="mt-2 text-lg font-semibold">{opportunity.title}</h3>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">{opportunity.category}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditTarget(opportunity);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil /> Edit
                    </Button>
                  </div>

                  <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
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
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-semibold">
                        {opportunity.acceptedCount} / {opportunity.spotsNeeded} positions claimed
                      </span>
                      <span className="text-muted-foreground">
                        {opportunity.status === "open" && opportunity.remainingPositions > 0
                          ? `${opportunity.remainingPositions} remaining`
                          : opportunity.status === "open"
                            ? "Full"
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

                  <div className="space-y-2 border-t border-border pt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Accepted volunteers ({opportunity.assignments.length})
                    </p>
                    {opportunity.assignments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No volunteers have accepted yet.</p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {opportunity.assignments.map((assignment) => (
                          <li
                            key={assignment.id}
                            className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium">{assignment.user.name}</p>
                              <p className="truncate text-xs text-muted-foreground">{assignment.user.email}</p>
                            </div>
                            <Badge variant="outline">
                              {assignment.status === "in_progress" ? "Working" : assignment.status.replaceAll("_", " ")}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
                    {opportunity.status === "draft" && (
                      <>
                        <StatusButton
                          label="Publish"
                          icon={Check}
                          onClick={() => setStatusTarget({ opportunity, status: "open" })}
                        />
                        <StatusButton
                          label="Cancel"
                          icon={X}
                          destructive
                          onClick={() => setStatusTarget({ opportunity, status: "cancelled" })}
                        />
                      </>
                    )}
                    {opportunity.status === "open" && (
                      <>
                        <StatusButton
                          label="Close"
                          icon={X}
                          onClick={() => setStatusTarget({ opportunity, status: "closed" })}
                        />
                        <StatusButton
                          label="Cancel"
                          icon={X}
                          destructive
                          onClick={() => setStatusTarget({ opportunity, status: "cancelled" })}
                        />
                        <StatusButton
                          label="Complete"
                          icon={Check}
                          onClick={() => setStatusTarget({ opportunity, status: "completed" })}
                        />
                      </>
                    )}
                    {opportunity.status === "closed" && (
                      <>
                        <StatusButton
                          label="Reopen"
                          icon={Check}
                          onClick={() => setStatusTarget({ opportunity, status: "open" })}
                        />
                        <StatusButton
                          label="Cancel"
                          icon={X}
                          destructive
                          onClick={() => setStatusTarget({ opportunity, status: "cancelled" })}
                        />
                        <StatusButton
                          label="Complete"
                          icon={Check}
                          onClick={() => setStatusTarget({ opportunity, status: "completed" })}
                        />
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit opportunity" : "Create opportunity"}</DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Update opportunity details. Required positions cannot be reduced below existing participations."
                : "Set the details and volunteer limit. Publish now or save as a draft."}
            </DialogDescription>
          </DialogHeader>
          <form key={editTarget?.id ?? "new"} onSubmit={saveOpportunity} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Title" name="title" required minLength={3} maxLength={120} defaultValue={editTarget?.title} />
              <FormField label="Category" name="category" required minLength={2} maxLength={80} defaultValue={editTarget?.category ?? "Community Support"} />
            </div>
            <div>
              <Label htmlFor="work-description">Description</Label>
              <Textarea
                id="work-description"
                name="description"
                required
                minLength={10}
                maxLength={5000}
                rows={5}
                defaultValue={editTarget?.description}
                className="mt-2"
              />
            </div>
            <FormField label="Location" name="location" required minLength={2} maxLength={200} defaultValue={editTarget?.location} />
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                label="Date"
                name="date"
                type="date"
                required
                defaultValue={editTarget?.date ? format(editTarget.date, "yyyy-MM-dd") : undefined}
              />
              <FormField label="Start time" name="startTime" type="time" required defaultValue={editTarget?.startTime ?? undefined} />
              <FormField label="End time" name="endTime" type="time" required defaultValue={editTarget?.endTime ?? undefined} />
            </div>
            <FormField
              label="Volunteers required"
              name="spotsNeeded"
              type="number"
              required
              min={editTarget?.acceptedCount ?? 1}
              max={1000}
              defaultValue={String(editTarget?.spotsNeeded ?? 5)}
            />
            {!editTarget && (
              <label className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm">
                <input
                  type="checkbox"
                  name="publish"
                  defaultChecked
                  className="h-4 w-4 accent-primary"
                />
                <span>
                  <span className="block font-medium">Publish immediately</span>
                  <span className="text-xs text-muted-foreground">
                    Volunteers can see and accept this opportunity.
                  </span>
                </span>
              </label>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : editTarget ? "Save changes" : "Create opportunity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!statusTarget}
        onOpenChange={(open) => !open && setStatusTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusTarget?.status === "open"
                ? "Publish or reopen opportunity?"
                : `${statusTarget?.status === "closed" ? "Close" : statusTarget?.status === "cancelled" ? "Cancel" : "Complete"} opportunity?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusTarget?.status === "cancelled"
                ? "Volunteers will no longer be able to accept this opportunity. Their participation history will be retained."
                : statusTarget?.status === "completed"
                  ? "All accepted volunteers must have completed their work before this can be completed."
                  : statusTarget?.status === "closed"
                    ? "This stops new volunteers from accepting. Current participants can continue updating their work status."
                    : "The opportunity will be visible to approved volunteers if there are still positions available."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Back</AlertDialogCancel>
            <Button
              type="button"
              variant={statusTarget?.status === "cancelled" ? "destructive" : "default"}
              disabled={pending}
              onClick={changeStatus}
            >
              {pending ? "Updating..." : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Summary({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function StatusButton({
  label,
  icon: Icon,
  destructive = false,
  onClick,
}: {
  label: string;
  icon: typeof Check;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={destructive ? "destructive" : "outline"}
      onClick={onClick}
    >
      <Icon /> {label}
    </Button>
  );
}

function FormField({
  label,
  name,
  ...props
}: {
  label: string;
  name: string;
} & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`work-${name}`}>{label}</Label>
      <Input id={`work-${name}`} name={name} {...props} />
    </div>
  );
}
