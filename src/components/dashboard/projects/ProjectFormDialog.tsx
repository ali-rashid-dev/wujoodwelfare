"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PROJECT_STATUSES,
  type ProjectStatus,
} from "@/validation/project";
import {
  createProject,
  updateProject,
  getProgramsForSelect,
  type ProjectRecord,
} from "@/actions/projects";
import { toast } from "sonner";
import {
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Plus,
  X,
  Globe,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import { Badge } from "@/components/ui/badge";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectRecord | null;
  onSuccess?: () => void;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planned",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

const PRESET_IMAGES = [
  { label: "Food Distribution", url: "/gallery-food.jpg" },
  { label: "Medical Care", url: "/gallery-medical.jpg" },
  { label: "Education Support", url: "/gallery-education.jpg" },
  { label: "Warm Clothes", url: "/gallery-clothes.jpg" },
  { label: "Community & Awareness", url: "/gallery-community.jpg" },
  { label: "Disaster Relief Volunteers", url: "/gallery-volunteers.jpg" },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseImages(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return raw ? [raw] : [];
  }
}

function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: ProjectFormDialogProps) {
  const isEditing = !!project;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<ProjectStatus>("planned");
  const [published, setPublished] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [programId, setProgramId] = useState("");
  const [programs, setPrograms] = useState<{ id: string; title: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  // Load programs for dropdown
  useEffect(() => {
    getProgramsForSelect().then(setPrograms);
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setSlug(project.slug);
      setDescription(project.description);
      setImages(parseImages(project.images));
      setStatus(project.status as ProjectStatus);
      setPublished(project.published);
      setStartDate(formatDateInput(project.startDate));
      setEndDate(formatDateInput(project.endDate));
      setLocation(project.location || "");
      setProgramId(project.programId || "");
      setAutoSlug(false);
    } else {
      setTitle("");
      setSlug("");
      setDescription("");
      setImages([PRESET_IMAGES[0].url]);
      setStatus("planned");
      setPublished(false);
      setStartDate("");
      setEndDate("");
      setLocation("");
      setProgramId("");
      setAutoSlug(true);
    }
  }, [project, open]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const addImage = (url: string) => {
    if (!url || images.includes(url)) return;
    setImages((prev) => [...prev, url]);
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a project title.");
      return;
    }

    if (!description.trim() || description.length < 10) {
      toast.error("Please provide a description of at least 10 characters.");
      return;
    }

    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be before start date.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      description: description.trim(),
      images,
      status,
      published,
      startDate: startDate || null,
      endDate: endDate || null,
      location: location.trim() || null,
      programId: programId || null,
    };

    try {
      if (isEditing && project) {
        const result = await updateProject(project.id, payload);
        if (result.success) {
          toast.success("Project updated successfully!");
          onOpenChange(false);
          onSuccess?.();
        } else {
          toast.error(result.error || "Failed to update project");
        }
      } else {
        const result = await createProject(payload);
        if (result.success) {
          toast.success("Project created successfully!");
          onOpenChange(false);
          onSuccess?.();
        } else {
          toast.error(result.error || "Failed to create project");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Edit Project" : "Create New Project"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update project details, status, dates, and images."
              : "Define a new welfare project. Link it to a program if needed."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="proj-title" className="text-xs font-semibold">
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="proj-title"
                placeholder="e.g. Winter Blanket Drive 2025"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="proj-slug" className="text-xs font-semibold">
                  URL Slug
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    setAutoSlug(false);
                    setSlug(slugify(title));
                  }}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <Sparkles className="h-3 w-3" /> Auto-generate
                </button>
              </div>
              <Input
                id="proj-slug"
                placeholder="winter-blanket-drive-2025"
                value={slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setSlug(slugify(e.target.value));
                }}
              />
            </div>
          </div>

          {/* Status & Published */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="proj-status" className="text-xs font-semibold">
                Status
              </Label>
              <select
                id="proj-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium"
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Visibility</Label>
              <button
                type="button"
                onClick={() => setPublished((v) => !v)}
                className={`w-full h-10 flex items-center justify-between px-3 rounded-md border text-sm font-semibold transition-all ${
                  published
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                    : "bg-muted border-input text-muted-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  {published ? (
                    <Globe className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  {published ? "Published (Visible to Public)" : "Unpublished (Hidden)"}
                </span>
                <span
                  className={`h-5 w-9 rounded-full transition-colors relative ${
                    published ? "bg-emerald-500" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      published ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>

          {/* Program linkage */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-program" className="text-xs font-semibold">
              Linked Program{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <select
              id="proj-program"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">No program (standalone project)</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              Optionally group this project under an existing welfare program.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-desc" className="text-xs font-semibold">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="proj-desc"
              rows={4}
              placeholder="Describe the project's objectives, target beneficiaries, and expected outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <p className="text-[11px] text-muted-foreground">
              {description.length} / 5000 characters
            </p>
          </div>

          {/* Dates & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="proj-start" className="text-xs font-semibold">
                Start Date
              </Label>
              <Input
                id="proj-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-end" className="text-xs font-semibold">
                End Date
              </Label>
              <Input
                id="proj-end"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-location" className="text-xs font-semibold">
                Location
              </Label>
              <Input
                id="proj-location"
                placeholder="e.g. Faisalabad, Punjab"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-primary" />
                Project Images
                {images.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                    {images.length}
                  </Badge>
                )}
              </Label>
            </div>

            {/* Current images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={img}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 group ${
                      idx === 0 ? "border-primary" : "border-border"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Image ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-[9px] font-bold text-center py-0.5">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove image ${idx + 1}`}
                      onClick={() => removeImage(img)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload new */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                Upload new image:
              </p>
              <UploadDropzone
                endpoint="programImage"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.ufsUrl) {
                    addImage(res[0].ufsUrl);
                  }
                }}
                onUploadError={(err) => {
                  console.error("Upload error:", err);
                  toast.error("Image upload failed.");
                }}
                className="ut-label:text-xs ut-label:font-semibold ut-label:text-foreground ut-allowed-content:text-muted-foreground ut-button:bg-primary ut-button:text-primary-foreground ut-button:rounded-lg ut-button:text-xs border-border bg-background"
              />
            </div>

            {/* Preset images */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                Or pick from library:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_IMAGES.map((preset) => {
                  const selected = images.includes(preset.url);
                  return (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() =>
                        selected ? removeImage(preset.url) : addImage(preset.url)
                      }
                      className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all text-[11px] ${
                        selected
                          ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                          : "border-border bg-card hover:bg-muted/70 text-foreground"
                      }`}
                    >
                      <div className="relative h-8 w-8 rounded-md overflow-hidden shrink-0 bg-muted">
                        <Image
                          src={preset.url}
                          alt={preset.label}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                      <span className="truncate">{preset.label}</span>
                      {selected && (
                        <span className="ml-auto shrink-0 h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[8px] text-primary-foreground font-bold">✓</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEditing ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
