"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { BriefcaseBusiness, CalendarDays, MapPin, Search } from "lucide-react";
import type { VolunteerAssignmentModel } from "@/generated/prisma/models/VolunteerAssignment";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
  | "opportunityId"
>;

type AssignmentView = "all" | "available" | "active" | "completed" | "rejected";

const views: { id: AssignmentView; label: string }[] = [
  { id: "all", label: "My assignments" },
  { id: "available", label: "Available to me" },
  { id: "active", label: "Accepted / working" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
];

export function VolunteerAssignments({
  assignments,
  initialView,
}: {
  assignments: Assignment[];
  initialView: AssignmentView;
}) {
  const [view, setView] = useState<AssignmentView>(initialView);
  const [search, setSearch] = useState("");
  const filteredAssignments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return assignments.filter((assignment) => {
      const matchesView =
        view === "all"
          ? assignment.status !== "pending"
          : view === "available"
            ? assignment.status === "pending"
            : view === "active"
              ? ["accepted", "in_progress"].includes(assignment.status)
              : view === "completed"
                ? assignment.status === "completed"
                : assignment.status === "declined";
      const matchesSearch =
        !normalizedSearch ||
        `${assignment.title} ${assignment.description} ${assignment.location ?? ""}`
          .toLocaleLowerCase()
          .includes(normalizedSearch);
      return matchesView && matchesSearch;
    });
  }, [assignments, search, view]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" aria-label="Assignment filters">
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            aria-pressed={view === item.id}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              view === item.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
            <span className="ml-1.5 opacity-75">
              {assignments.filter((assignment) => {
                if (item.id === "all") return assignment.status !== "pending";
                if (item.id === "available") return assignment.status === "pending";
                if (item.id === "active") return ["accepted", "in_progress"].includes(assignment.status);
                if (item.id === "completed") return assignment.status === "completed";
                return assignment.status === "declined";
              }).length}
            </span>
          </button>
        ))}
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search assignments"
          className="pl-9"
        />
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <BriefcaseBusiness className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">No assignments found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {view === "available"
              ? "There are no assignments waiting for your response."
              : "Assignments matching this view will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredAssignments.map((assignment) => (
            <Link
              key={assignment.id}
              href={`/volunteer/assignments/${assignment.id}`}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold group-hover:text-primary">{assignment.title}</h2>
                <Badge variant="outline">
                  {assignment.status === "in_progress" ? "Working" : assignment.status.replaceAll("_", " ")}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {assignment.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2.5 py-1 capitalize">
                  {assignment.priority} priority
                </span>
                {assignment.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {assignment.location}
                  </span>
                )}
                {assignment.deadline && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Due {format(assignment.deadline, "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
