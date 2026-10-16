"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Quote,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createImpactStory,
  deleteImpactStory,
  toggleImpactStoryPublish,
  updateImpactStory,
  type getAdminImpactStories,
} from "@/actions/impact-stories";
import { UploadDropzone } from "@/lib/uploadthing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListPagination } from "@/components/ui/list-pagination";
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

type ImpactStoryRecord = Awaited<ReturnType<typeof getAdminImpactStories>>[number];
type VisibilityFilter = "all" | "published" | "draft";

export function ImpactStoriesManagement({
  initialStories,
}: {
  initialStories: ImpactStoryRecord[];
}) {
  const [stories, setStories] = useState(initialStories);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<VisibilityFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<ImpactStoryRecord | null>(null);
  const [deletingStory, setDeletingStory] = useState<ImpactStoryRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pageSize = 9;

  const filteredStories = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return stories.filter((story) => {
      const matchesVisibility =
        filter === "all" ||
        (filter === "published" && story.published) ||
        (filter === "draft" && !story.published);
      const matchesQuery =
        !normalizedQuery ||
        `${story.name} ${story.role} ${story.text}`
          .toLocaleLowerCase()
          .includes(normalizedQuery);
      return matchesVisibility && matchesQuery;
    });
  }, [filter, query, stories]);
  const {
    currentPage,
    pageCount,
    pageItems,
    setPage,
    resetPage,
  } = useClientPagination(filteredStories, pageSize);

  const openCreate = () => {
    setEditingStory(null);
    setFormOpen(true);
  };

  const openEdit = (story: ImpactStoryRecord) => {
    setEditingStory(story);
    setFormOpen(true);
  };

  const handleSaved = (story: ImpactStoryRecord, warning?: string) => {
    setStories((current) =>
      editingStory
        ? current.map((existing) => (existing.id === story.id ? story : existing))
        : [story, ...current],
    );
    if (!editingStory) resetPage();
    setFormOpen(false);
    setEditingStory(null);
    toast.success(editingStory ? "Impact story updated." : "Impact story created.");
    if (warning) toast.warning(warning);
  };

  const handleTogglePublish = (story: ImpactStoryRecord) => {
    startTransition(async () => {
      try {
        const result = await toggleImpactStoryPublish(story.id);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setStories((current) =>
          current.map((item) =>
            item.id === story.id ? { ...item, published: result.published } : item,
          ),
        );
        toast.success(result.published ? "Story published." : "Story moved to drafts.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not change story visibility.");
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingStory) return;
    setIsDeleting(true);
    try {
      const result = await deleteImpactStory(deletingStory.id);
      if (!result.success) {
        toast.error(result.error);
      } else {
        setStories((current) => current.filter((item) => item.id !== deletingStory.id));
        toast.success(`"${deletingStory.name}" deleted.`);
        if (result.warning) toast.warning(result.warning);
        setDeletingStory(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete impact story.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total stories" value={stories.length} />
        <StatCard
          label="Published"
          value={stories.filter((story) => story.published).length}
          valueClass="text-emerald-600"
        />
        <StatCard
          label="Drafts"
          value={stories.filter((story) => !story.published).length}
          valueClass="text-amber-600"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative sm:max-w-sm sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetPage();
              }}
              placeholder="Search stories..."
              className="pl-9"
            />
          </div>
          <select
            aria-label="Filter impact stories by publication status"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value as VisibilityFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All stories</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add story
        </Button>
      </div>

      {filteredStories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((story) => (
            <article
              key={story.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={story.imageUrl}
                  alt={story.name}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <Badge
                  className="absolute left-3 top-3"
                  variant={story.published ? "default" : "secondary"}
                >
                  {story.published ? "Published" : "Draft"}
                </Badge>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="font-semibold">{story.name}</p>
                  <p className="text-sm text-muted-foreground">{story.role}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    “{story.text}”
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(story)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleTogglePublish(story)}
                  >
                    {story.published ? (
                      <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {story.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeletingStory(story)}
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
          <Quote className="mx-auto h-9 w-9 text-muted-foreground" />
          <p className="mt-3 font-medium">No impact stories found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a story to share how Wujood Welfare is making a difference.
          </p>
        </div>
      )}

      <ListPagination
        currentPage={currentPage}
        pageCount={pageCount}
        totalItems={filteredStories.length}
        pageSize={pageSize}
        itemLabel="stories"
        onPageChange={setPage}
      />

      {formOpen && (
        <ImpactStoryDialog
          key={editingStory?.id ?? "new"}
          open={formOpen}
          onOpenChange={setFormOpen}
          story={editingStory}
          onSaved={handleSaved}
        />
      )}

      <AlertDialog
        open={!!deletingStory}
        onOpenChange={(open) => !open && setDeletingStory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this impact story?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the story from the admin list and public
              carousel. Its uploaded image will also be removed when possible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete story"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function ImpactStoryDialog({
  open,
  onOpenChange,
  story,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: ImpactStoryRecord | null;
  onSaved: (story: ImpactStoryRecord, warning?: string) => void;
}) {
  const [name, setName] = useState(story?.name ?? "");
  const [role, setRole] = useState(story?.role ?? "");
  const [text, setText] = useState(story?.text ?? "");
  const [imageUrl, setImageUrl] = useState(story?.imageUrl ?? "");
  const [published, setPublished] = useState(story?.published ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageUrl) {
      toast.error("Upload an image before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = { name, role, text, imageUrl, published };
      const result = story
        ? await updateImpactStory(story.id, payload)
        : await createImpactStory(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onSaved(result.story, result.warning);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save impact story.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{story ? "Edit impact story" : "Add impact story"}</DialogTitle>
          <DialogDescription>
            Add a first-hand story and choose whether it appears on the public website.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Story image</Label>
            {imageUrl ? (
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={imageUrl}
                  alt={name || "Impact story image preview"}
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-3 right-3"
                  onClick={() => setImageUrl("")}
                >
                  Replace image
                </Button>
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
                  button: "bg-primary text-primary-foreground",
                }}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact-story-name">Name</Label>
            <Input
              id="impact-story-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact-story-role">Role or location</Label>
            <Input
              id="impact-story-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="e.g. Parent of two, Faisalabad"
              maxLength={180}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact-story-text">Story</Label>
            <Textarea
              id="impact-story-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={1500}
              rows={5}
              required
            />
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
                <Eye className="h-4 w-4 text-emerald-600" />
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
            <Button type="submit" disabled={isSaving || !imageUrl}>
              {isSaving ? "Saving..." : story ? "Save changes" : "Add story"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
