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
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by title, slug, location, or program..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-background"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            onChange={(e) => setPublishedFilter(e.target.value)}
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

      {/* ── Projects Table ─────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-bold text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Project</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Program</th>
                <th className="px-4 py-3.5">Dates</th>
                <th className="px-4 py-3.5">Visibility</th>
                <th className="px-4 py-3.5">Updated</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                        <Layers className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-foreground">No projects found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {query || statusFilter !== "all" || publishedFilter !== "all"
                          ? "Try adjusting your search criteria or filters."
                          : "Create your first welfare project using the button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const imgs = parseImages(p.images);
                  const coverImg = imgs[0] || null;
                  const statusCfg = STATUS_CONFIG[p.status as ProjectStatus] || STATUS_CONFIG.planned;
                  const StatusIcon = statusCfg.icon;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Project Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-border bg-muted">
                            {coverImg ? (
                              <Image
                                src={coverImg}
                                alt={p.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">
                                <Layers className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <p className="font-bold text-foreground text-sm truncate">
                              {p.title}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate">
                              /{p.slug}
                            </p>
                            {p.location && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {p.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`font-bold text-[11px] gap-1 px-2 py-0.5 ${statusCfg.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </Badge>
                      </td>

                      {/* Program */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {p.program ? (
                          <Badge
                            variant="secondary"
                            className="font-medium text-xs px-2.5 py-0.5 rounded-lg max-w-[140px] truncate"
                            title={p.program.title}
                          >
                            {p.program.title}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="px-4 py-4">
                        <div className="text-xs space-y-0.5">
                          {p.startDate ? (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span>{formatDate(p.startDate)}</span>
                            </div>
                          ) : null}
                          {p.endDate ? (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <span className="ml-3.5">→ {formatDate(p.endDate)}</span>
                            </div>
                          ) : null}
                          {!p.startDate && !p.endDate && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>

                      {/* Publish Toggle */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Button
                          variant={p.published ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleTogglePublish(p)}
                          disabled={isPending}
                          className={`h-8 text-xs font-semibold rounded-lg gap-1.5 ${
                            p.published
                              ? "text-muted-foreground hover:text-destructive hover:border-destructive/40"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
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
                      </td>

                      {/* Updated Date */}
                      <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(p.updatedAt || p.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {p.published && (
                            <Link
                              href={`/projects/${p.slug}`}
                              target="_blank"
                              title="View on public site"
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(p)}
                            title="Edit project"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePrompt(p)}
                            title="Delete project"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
