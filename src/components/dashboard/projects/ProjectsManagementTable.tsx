"use client";

import React, { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Globe,
  EyeOff,
  ExternalLink,
  Layers,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  Archive,
  PlayCircle,
  CheckSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/ui/list-pagination";
import { useClientPagination } from "@/hooks/use-client-pagination";
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
import { ProjectFormDialog } from "./ProjectFormDialog";
import {
  deleteProject,
  toggleProjectPublish,
  type ProjectRecord,
} from "@/actions/projects";
import { toast } from "sonner";
import { PROJECT_STATUSES, type ProjectStatus } from "@/validation/project";

interface ProjectsManagementTableProps {
  initialProjects: ProjectRecord[];
}

function parseImages(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return raw ? [raw] : [];
  }
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  planned: {
    label: "Planned",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: Clock,
  },
  active: {
    label: "Active",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: PlayCircle,
  },
  completed: {
    label: "Completed",
    className:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
    icon: CheckSquare,
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground border-border",
    icon: Archive,
  },
};

export function ProjectsManagementTable({
  initialProjects,
}: ProjectsManagementTableProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const pageSize = 10;

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Metrics
  const totalCount = projects.length;
  const publishedCount = projects.filter((p) => p.published).length;
  const draftCount = projects.filter((p) => !p.published).length;
  const activeCount = projects.filter((p) => p.status === "active").length;

  // Filtered list
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.location || "").toLowerCase().includes(q) ||
        (p.program?.title || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      const matchesPublished =
        publishedFilter === "all" ||
        (publishedFilter === "published" && p.published) ||
        (publishedFilter === "unpublished" && !p.published);

      return matchesQuery && matchesStatus && matchesPublished;
    });
  }, [projects, query, statusFilter, publishedFilter]);
  const {
    currentPage,
    pageCount,
    pageItems: paginatedProjects,
    setPage,
    resetPage,
  } = useClientPagination(filtered, pageSize);

  const handleCreateNew = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  const handleEdit = (p: ProjectRecord) => {
    setEditingProject(p);
    setFormOpen(true);
  };

  const handleDeletePrompt = (p: ProjectRecord) => {
    setProjectToDelete(p);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteProject(projectToDelete.id);
      if (result.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
        toast.success(`"${projectToDelete.title}" deleted.`);
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
      } else {
        toast.error(result.error || "Failed to delete project.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete project.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (p: ProjectRecord) => {
    const nextPublished = !p.published;

    // Optimistic update
    setProjects((prev) =>
      prev.map((item) =>
        item.id === p.id ? { ...item, published: nextPublished } : item
      )
    );

    startTransition(async () => {
      const res = await toggleProjectPublish(p.id);
      if (res.success) {
        toast.success(
          nextPublished
            ? `Published! "${p.title}" is now visible on the public website.`
            : `Unpublished! "${p.title}" is now hidden from public visitors.`
        );
      } else {
        // Rollback
        setProjects((prev) =>
          prev.map((item) =>
            item.id === p.id ? { ...item, published: p.published } : item
          )
        );
        toast.error(res.error || "Failed to change publication status.");
      }
    });
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Projects
            </span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-foreground">
            {totalCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">All welfare projects</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Published
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {publishedCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Visible on public site</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hidden / Draft
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {draftCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Unpublished projects</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active
            </span>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <PlayCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-foreground">
            {activeCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Currently running</p>
        </div>
      </div>

      {/* ── Filters & Action Bar ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by title, slug, location, or program..."
            aria-label="Search projects"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
            className="pl-9 h-10 rounded-xl bg-background"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              resetPage();
            }}
            aria-label="Filter projects by status"
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>

          <select
            value={publishedFilter}
            onChange={(e) => {
              setPublishedFilter(e.target.value);
              resetPage();
            }}
            aria-label="Filter projects by visibility"
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Visibility</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>

          <Button
            onClick={handleCreateNew}
            className="h-10 rounded-xl font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </div>
      </div>

      {/* ── Projects ────────────────────────────────────────────── */}
      <section aria-label="Projects" className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="font-semibold text-foreground">Projects</h2>
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {totalCount}
          </p>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-12 text-center text-muted-foreground shadow-xs">
            <div className="mx-auto flex max-w-sm flex-col items-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Layers className="h-6 w-6" />
              </div>
              <p className="font-semibold text-foreground">No projects found</p>
              <p className="mt-1 text-xs">
                {query || statusFilter !== "all" || publishedFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Create your first welfare project using the button above."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedProjects.map((p) => {
              const imgs = parseImages(p.images);
              const coverImg = imgs[0] || null;
              const statusCfg =
                STATUS_CONFIG[p.status as ProjectStatus] || STATUS_CONFIG.planned;
              const StatusIcon = statusCfg.icon;

              return (
                <article
                  key={p.id}
                  className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-primary/30 sm:p-5"
                >
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:h-14 sm:w-14">
                      {coverImg ? (
                        <Image
                          src={coverImg}
                          alt={p.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                          <Layers className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-sm font-bold text-foreground sm:text-base">
                        {p.title}
                      </h3>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        /{p.slug}
                      </p>
                      {p.location && (
                        <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{p.location}</span>
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 gap-1 px-2 py-0.5 text-[11px] font-bold ${statusCfg.className}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusCfg.label}
                    </Badge>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 border-y border-border py-4 sm:grid-cols-4 sm:gap-x-5">
                    <div className="min-w-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Program
                      </dt>
                      <dd className="mt-1 min-w-0">
                        {p.program ? (
                          <Badge
                            variant="secondary"
                            className="block max-w-full truncate rounded-lg px-2.5 py-0.5 text-xs font-medium"
                            title={p.program.title}
                          >
                            {p.program.title}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Schedule
                      </dt>
                      <dd className="mt-1 space-y-1 text-xs text-muted-foreground">
                        {p.startDate || p.endDate ? (
                          <>
                            {p.startDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span className="truncate">{formatDate(p.startDate)}</span>
                              </div>
                            )}
                            {p.endDate && (
                              <div className="truncate">
                                {p.startDate ? "→ " : ""}
                                {formatDate(p.endDate)}
                              </div>
                            )}
                          </>
                        ) : (
                          <span>—</span>
                        )}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Visibility
                      </dt>
                      <dd className="mt-1 flex items-center gap-1.5 text-xs">
                        {p.published ? (
                          <>
                            <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">
                              Published
                            </span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Unpublished</span>
                          </>
                        )}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Updated
                      </dt>
                      <dd className="mt-1 truncate text-xs text-muted-foreground">
                        {formatDate(p.updatedAt || p.createdAt)}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                    <Button
                      variant={p.published ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleTogglePublish(p)}
                      disabled={isPending}
                      className={`h-9 gap-1.5 rounded-lg text-xs font-semibold ${
                        p.published
                          ? "text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {p.published ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Globe className="h-3.5 w-3.5" />
                          Publish
                        </>
                      )}
                    </Button>
                    <div className="ml-auto flex items-center gap-1">
                      {p.published && (
                        <Link
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View ${p.title} on public site`}
                          title="View on public site"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(p)}
                        aria-label={`Edit ${p.title}`}
                        title="Edit project"
                        className="h-9 w-9 rounded-lg p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePrompt(p)}
                        aria-label={`Delete ${p.title}`}
                        title="Delete project"
                        className="h-9 w-9 rounded-lg p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <ListPagination
          currentPage={currentPage}
          pageCount={pageCount}
          totalItems={filtered.length}
          pageSize={pageSize}
          itemLabel="projects"
          onPageChange={setPage}
        />
      </section>

      {/* ── Create / Edit Dialog ─────────────────────────────────── */}
      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={editingProject}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* ── Delete Confirmation Dialog ────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-foreground">
                  &ldquo;{projectToDelete?.title}&rdquo;
                </span>
                ?
              </p>
              <p className="text-xs text-muted-foreground">
                This will permanently remove the project and its data. This action cannot
                be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
