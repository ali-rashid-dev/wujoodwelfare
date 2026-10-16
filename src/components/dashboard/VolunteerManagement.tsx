"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Check,
  Eye,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { updateVolunteerApplicationStatus } from "@/actions/volunteers";
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
  const [pendingApplicationId, setPendingApplicationId] = useState<string | null>(null);

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
