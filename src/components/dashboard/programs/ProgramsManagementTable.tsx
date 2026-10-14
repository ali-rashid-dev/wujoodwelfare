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
import { ProgramFormDialog } from "./ProgramFormDialog";
import {
  deleteProgram,
  toggleProgramPublish,
  type ProgramRecord,
} from "@/actions/programs";
import { toast } from "sonner";
import { PROGRAM_CATEGORIES } from "@/validation/program";

interface ProgramsManagementTableProps {
  initialPrograms: ProgramRecord[];
}

export function ProgramsManagementTable({
  initialPrograms,
}: ProgramsManagementTableProps) {
  const [programs, setPrograms] = useState<ProgramRecord[]>(initialPrograms);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const pageSize = 10;

  const [formOpen, setFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramRecord | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<ProgramRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Metrics calculation
  const totalCount = programs.length;
  const publishedCount = programs.filter(
    (p) => p.status === "published" || p.status === "active"
  ).length;
  const draftCount = programs.filter((p) => p.status === "draft").length;

  // Filtered list
  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const isPublished = p.status === "published" || p.status === "active";
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && isPublished) ||
        p.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || p.category === categoryFilter;

      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [programs, query, statusFilter, categoryFilter]);
  const {
    currentPage,
    pageCount,
    pageItems: paginatedPrograms,
    setPage,
    resetPage,
  } = useClientPagination(filtered, pageSize);

  const handleCreateNew = () => {
    setEditingProgram(null);
    setFormOpen(true);
  };

  const handleEdit = (p: ProgramRecord) => {
    setEditingProgram(p);
    setFormOpen(true);
  };

  const handleDeletePrompt = (p: ProgramRecord) => {
    setProgramToDelete(p);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!programToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteProgram(programToDelete.id);
      if (result.success) {
        setPrograms((prev) => prev.filter((p) => p.id !== programToDelete.id));
        toast.success(`"${programToDelete.title}" deleted.`);
        setDeleteDialogOpen(false);
        setProgramToDelete(null);
      } else {
        toast.error(result.error || "Failed to delete program.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete program.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (p: ProgramRecord) => {
    const isCurrentlyPublished =
      p.status === "published" || p.status === "active";
    const nextStatus = isCurrentlyPublished ? "draft" : "published";

    // Optimistic update
    setPrograms((prev) =>
      prev.map((item) =>
        item.id === p.id ? { ...item, status: nextStatus } : item
      )
    );

    startTransition(async () => {
      const res = await toggleProgramPublish(p.id);
      if (res.success) {
        toast.success(
          nextStatus === "published"
            ? `Published! "${p.title}" is now visible on the public website.`
            : `Unpublished! "${p.title}" is now in draft mode.`
        );
      } else {
        // Rollback
        setPrograms((prev) =>
          prev.map((item) =>
            item.id === p.id ? { ...item, status: p.status } : item
          )
        );
        toast.error(res.error || "Failed to change publication status.");
      }
    });
  };

  const formatPKR = (num?: number | null) => {
    if (!num) return "—";
    return `PKR ${num.toLocaleString()}`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Programs
            </span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-foreground">
            {totalCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Managed welfare initiatives</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Published (Public)
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
              Drafts / Hidden
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {draftCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Unpublished drafts</p>
        </div>
      </div>

      {/* ── Filters & Action Bar ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs by title, category, slug..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
            className="pl-9 h-10 rounded-xl bg-background"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              resetPage();
            }}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              resetPage();
            }}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Categories</option>
            {PROGRAM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Create Button */}
          <Button
            onClick={handleCreateNew}
            className="h-10 rounded-xl font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Program
          </Button>
        </div>
      </div>

      {/* ── Programs Table ───────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-bold text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Program</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Publish Toggle</th>
                <th className="px-4 py-3.5">Updated</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                        <Layers className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-foreground">No programs found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {query || statusFilter !== "all" || categoryFilter !== "all"
                          ? "Try adjusting your search criteria or filters."
                          : "Create your first welfare program using the button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPrograms.map((p) => {
                  const isPublished =
                    p.status === "published" || p.status === "active";
                  const isDraft = p.status === "draft";

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Program Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-border bg-muted">
                            {p.imageUrl ? (
                              <Image
                                src={p.imageUrl}
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
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className="font-medium text-xs px-2.5 py-0.5 rounded-lg"
                        >
                          {p.category}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isPublished ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold text-[11px] gap-1 px-2 py-0.5"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Published
                          </Badge>
                        ) : isDraft ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold text-[11px] gap-1 px-2 py-0.5"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Draft
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground border-border font-bold text-[11px] px-2 py-0.5"
                          >
                            Archived
                          </Badge>
                        )}
                      </td>

                      {/* Publish / Unpublish Toggle */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Button
                          variant={isPublished ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleTogglePublish(p)}
                          disabled={isPending}
                          className={`h-8 text-xs font-semibold rounded-lg gap-1.5 ${
                            isPublished
                              ? "text-muted-foreground hover:text-destructive hover:border-destructive/40"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {isPublished ? (
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
                          {isPublished && (
                            <Link
                              href="/programs"
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
                            title="Edit program"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePrompt(p)}
                            title="Delete program"
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
      <ListPagination
        currentPage={currentPage}
        pageCount={pageCount}
        totalItems={filtered.length}
        pageSize={pageSize}
        itemLabel="programs"
        onPageChange={setPage}
      />

      {/* ── Create / Edit Dialog ─────────────────────────────── */}
      <ProgramFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        program={editingProgram}
        onSuccess={() => {
          // Re-fetch or reload page
          window.location.reload();
        }}
      />

      {/* ── Delete Confirmation Dialog ──────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>Delete Welfare Program?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-foreground">
                  &ldquo;{programToDelete?.title}&rdquo;
                </span>
                ?
              </p>
              <p className="text-xs text-muted-foreground">
                This will remove the program and its associated records from the database. This action cannot be undone.
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
