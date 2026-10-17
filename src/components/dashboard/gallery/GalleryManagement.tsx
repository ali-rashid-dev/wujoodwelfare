"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createGalleryItem,
  deleteGalleryItem,
  toggleGalleryItemPublish,
  updateGalleryItem,
  type GalleryItemRecord,
} from "@/actions/gallery";
import {
  UploadDropzone,
  uploadDropzoneButtonClassName,
} from "@/lib/uploadthing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/ui/list-pagination";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GalleryProject = { id: string; title: string };

interface GalleryManagementProps {
  initialItems: GalleryItemRecord[];
  projects: GalleryProject[];
}

export function GalleryManagement({
  initialItems,
  projects,
}: GalleryManagementProps) {
  const [items, setItems] = useState(initialItems);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItemRecord | null>(null);
  const [deleteItem, setDeleteItem] = useState<GalleryItemRecord | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "unpublished">("all");
  const [query, setQuery] = useState("");
  const pageSize = 12;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const visibilityMatches =
        filter === "all" ||
        (filter === "published" && item.published) ||
        (filter === "unpublished" && !item.published);
      const queryMatches =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        (item.project?.title ?? "").toLowerCase().includes(normalizedQuery);
      return visibilityMatches && queryMatches;
    });
  }, [filter, items, query]);
  const {
    currentPage,
    pageCount,
    pageItems: paginatedItems,
    setPage,
    resetPage,
  } = useClientPagination(filtered, pageSize);

  const openCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEdit = (item: GalleryItemRecord) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSaved = (item: GalleryItemRecord) => {
    setItems((current) =>
      editingItem
        ? current.map((existing) => (existing.id === item.id ? item : existing))
        : [item, ...current],
    );
    if (!editingItem) resetPage();
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleTogglePublish = async (item: GalleryItemRecord) => {
    const result = await toggleGalleryItemPublish(item.id);
    if (!result.success || typeof result.published !== "boolean") {
      toast.error("error" in result ? result.error : "Could not update publication status.");
      return;
    }
    setItems((current) =>
      current.map((existing) =>
        existing.id === item.id
          ? { ...existing, published: result.published }
          : existing,
      ),
    );
    toast.success(
      result.published ? "Photo published to the public gallery." : "Photo unpublished.",
    );
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const result = await deleteGalleryItem(deleteItem.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setItems((current) => current.filter((item) => item.id !== deleteItem.id));
    toast.success(`"${deleteItem.title}" deleted.`);
    if (result.warning) toast.warning(result.warning);
    setDeleteItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total images
          </p>
          <p className="mt-2 text-3xl font-bold">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Published
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {items.filter((item) => item.published).length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Drafts
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {items.filter((item) => !item.published).length}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="Search captions, categories, or projects..."
            className="sm:max-w-sm"
          />
          <select
            aria-label="Filter gallery by publication status"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value as typeof filter)
              resetPage();
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All images</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add image
        </Button>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginatedItems.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <Badge
                  className="absolute left-3 top-3"
                  variant={item.published ? "default" : "secondary"}
                >
                  {item.published ? "Published" : "Draft"}
                </Badge>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="line-clamp-2 font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.category}
                    {item.project ? ` · ${item.project.title}` : ""}
                  </p>
                  {item.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleTogglePublish(item)}
                  >
                    {item.published ? (
                      <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {item.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteItem(item)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <ImageIcon className="mx-auto h-9 w-9 text-muted-foreground" />
          <p className="mt-3 font-medium">No gallery images found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a photo to start documenting welfare activities.
          </p>
        </div>
      )}

      <ListPagination
        currentPage={currentPage}
        pageCount={pageCount}
        totalItems={filtered.length}
        pageSize={pageSize}
        itemLabel="images"
        onPageChange={setPage}
      />

      {formOpen && (
        <GalleryItemDialog
          key={editingItem?.id ?? "new"}
          open={formOpen}
          onOpenChange={setFormOpen}
          item={editingItem}
          projects={projects}
          onSaved={handleSaved}
        />
      )}

      <AlertDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this gallery image?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the image from the public gallery and deletes its
              uploaded file when it is stored with UploadThing. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()}>
              Delete image
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GalleryItemDialog({
  open,
  onOpenChange,
  item,
  projects,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: GalleryItemRecord | null;
  projects: GalleryProject[];
  onSaved: (item: GalleryItemRecord) => void;
}) {
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [projectId, setProjectId] = useState(item?.projectId ?? "");
  const [published, setPublished] = useState(item?.published ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item && !imageUrl) {
      toast.error("Upload an image before saving.");
      return;
    }

    setIsSaving(true);
    const payload = {
      title,
      category,
      description: description || null,
      projectId: projectId || null,
      published,
    };

    try {
      const result = item
        ? await updateGalleryItem(item.id, payload)
        : await createGalleryItem({ ...payload, imageUrl });

      if (!result.success || !result.item) {
        toast.error("error" in result ? result.error : "Unable to save image.");
        return;
      }
      toast.success(item ? "Gallery image updated." : "Image added to gallery.");
      onSaved(result.item);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save image.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl lg:max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit gallery image" : "Add gallery image"}</DialogTitle>
          <DialogDescription>
            {item
              ? "Update the caption, category, project, and visibility."
              : "Upload an activity photo and add its caption and details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Image</Label>
            {imageUrl ? (
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={imageUrl}
                  alt={title || "Gallery image preview"}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <UploadDropzone
                endpoint="galleryImage"
                onClientUploadComplete={(files) => {
                  const uploadedUrl = files[0]?.ufsUrl;
                  if (uploadedUrl) {
                    setImageUrl(uploadedUrl);
                    toast.success("Image uploaded.");
                  }
                }}
                onUploadError={(error) => {
                  toast.error(error.message);
                }}
                config={{ mode: "auto" }}
                appearance={{
                  container: "border-border bg-muted/30",
                  label: "text-foreground",
                  button: uploadDropzoneButtonClassName,
                }}
              />
            )}
            {item && (
              <p className="text-xs text-muted-foreground">
                To replace this file, delete the entry and upload it again.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gallery-title">Caption</Label>
            <Input
              id="gallery-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={180}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gallery-category">Category</Label>
            <Input
              id="gallery-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              maxLength={80}
              placeholder="e.g. Food Distribution"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gallery-description">
              Description <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="gallery-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gallery-project">
              Associated project <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <select
              id="gallery-project"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span className="flex items-center gap-2 text-sm font-medium">
              {published ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              Publish on the public website
            </span>
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || (!item && !imageUrl)}>
              {isSaving ? "Saving..." : item ? "Save changes" : "Add image"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
