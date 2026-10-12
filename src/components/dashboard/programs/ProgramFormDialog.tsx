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
  PROGRAM_CATEGORIES,
  PROGRAM_STATUSES,
  type ProgramStatus,
} from "@/validation/program";
import { createProgram, updateProgram, type ProgramRecord } from "@/actions/programs";
import { toast } from "sonner";
import { Loader2, Sparkles, Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";

interface ProgramFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program?: ProgramRecord | null;
  onSuccess?: () => void;
}

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

export function ProgramFormDialog({
  open,
  onOpenChange,
  program,
  onSuccess,
}: ProgramFormDialogProps) {
  const isEditing = !!program;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [targetBeneficiaries, setTargetBeneficiaries] = useState("0");
  const [currentBeneficiaries, setCurrentBeneficiaries] = useState("0");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState<ProgramStatus>("draft");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (program) {
      setTitle(program.title);
      setSlug(program.slug);
      setCategory(program.category);
      setDescription(program.description);
      setTargetBeneficiaries(String(program.targetBeneficiaries || 0));
      setCurrentBeneficiaries(String(program.currentBeneficiaries || 0));
      setBudget(program.budget ? String(program.budget) : "");
      setStatus(
        program.status === "active"
          ? "published"
          : (program.status as ProgramStatus) || "draft"
      );
      setImageUrl(program.imageUrl || "");
      setAutoSlug(false);
    } else {
      setTitle("");
      setSlug("");
      setCategory("Food");
      setDescription("");
      setTargetBeneficiaries("0");
      setCurrentBeneficiaries("0");
      setBudget("");
      setStatus("published");
      setImageUrl("/gallery-food.jpg");
      setAutoSlug(true);
    }
  }, [program, open]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a program title.");
      return;
    }

    if (!description.trim() || description.length < 10) {
      toast.error("Please provide a description of at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      category,
      description: description.trim(),
      targetBeneficiaries: Number(targetBeneficiaries) || 0,
      currentBeneficiaries: Number(currentBeneficiaries) || 0,
      budget: budget ? Number(budget) : null,
      status,
      imageUrl: imageUrl.trim() || null,
    };

    try {
      if (isEditing && program) {
        const result = await updateProgram(program.id, payload);
        if (result.success) {
          toast.success("Program updated successfully!");
          onOpenChange(false);
          onSuccess?.();
        } else {
          toast.error(result.error || "Failed to update program");
        }
      } else {
        const result = await createProgram(payload);
        if (result.success) {
          toast.success("Program created successfully!");
          onOpenChange(false);
          onSuccess?.();
        } else {
          toast.error(result.error || "Failed to create program");
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
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {isEditing ? "Edit Welfare Program" : "Create New Welfare Program"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update details, target impact goals, status, and cover photo."
              : "Define a new welfare initiative to be showcased to donors and volunteers."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prog-title" className="text-xs font-semibold">
                Program Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prog-title"
                placeholder="e.g. Daily Ramadan Iftar Drive"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="prog-slug" className="text-xs font-semibold">
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
                id="prog-slug"
                placeholder="daily-ramadan-iftar-drive"
                value={slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setSlug(slugify(e.target.value));
                }}
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prog-cat" className="text-xs font-semibold">
                Category
              </Label>
              <select
                id="prog-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PROGRAM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prog-status" className="text-xs font-semibold">
                Status
              </Label>
              <select
                id="prog-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProgramStatus)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium"
              >
                <option value="published">Published (Visible on Public Website)</option>
                <option value="draft">Draft (Hidden from Public)</option>
                <option value="archived">Archived (Hidden from Public)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="prog-desc" className="text-xs font-semibold">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="prog-desc"
              rows={4}
              placeholder="Detailed description of the program's objectives, community benefit, and field distribution operations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Shown on the public programs overview card and detail dialog.
            </p>
          </div>

          {/* Beneficiaries & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prog-target" className="text-xs font-semibold">
                Target Beneficiaries
              </Label>
              <Input
                id="prog-target"
                type="number"
                min="0"
                placeholder="5000"
                value={targetBeneficiaries}
                onChange={(e) => setTargetBeneficiaries(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prog-current" className="text-xs font-semibold">
                Current Beneficiaries
              </Label>
              <Input
                id="prog-current"
                type="number"
                min="0"
                placeholder="3200"
                value={currentBeneficiaries}
                onChange={(e) => setCurrentBeneficiaries(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prog-budget" className="text-xs font-semibold">
                Budget (PKR)
              </Label>
              <Input
                id="prog-budget"
                type="number"
                min="0"
                placeholder="1500000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-primary" />
                Cover Image
              </Label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="flex items-center gap-1 text-[11px] text-destructive hover:underline"
                >
                  <X className="h-3 w-3" /> Clear image
                </button>
              )}
            </div>

            {/* Live preview */}
            {imageUrl && (
              <div className="relative h-36 w-full rounded-lg overflow-hidden border border-border bg-muted">
                <Image
                  src={imageUrl}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              </div>
            )}

            {/* UploadThing dropzone */}
            {!imageUrl && (
              <UploadDropzone
                endpoint="programImage"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.ufsUrl) {
                    setImageUrl(res[0].ufsUrl);
                  }
                }}
                onUploadError={(err) => {
                  console.error("Upload error:", err);
                }}
                className="ut-label:text-xs ut-label:font-semibold ut-label:text-foreground ut-allowed-content:text-muted-foreground ut-button:bg-primary ut-button:text-primary-foreground ut-button:rounded-lg ut-button:text-xs border-border bg-background"
              />
            )}

            {/* Presets fallback */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                Or select an existing impact asset:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all text-[11px] ${
                      imageUrl === preset.url
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
                  </button>
                ))}
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
              {isEditing ? "Save Changes" : "Create Program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
