"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  Eye,
  HandHeart,
  Heart,
  Info,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import {
  createWhoWeAreValue,
  discardWhoWeAreImageUpload,
  deleteWhoWeAreValue,
  updateWhoWeAre,
  updateWhoWeAreValue,
  type getAdminWhoWeAre,
} from "@/actions/who-we-are";
import {
  UploadDropzone,
  uploadDropzoneButtonClassName,
} from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type InitialData = Awaited<ReturnType<typeof getAdminWhoWeAre>>;
type WhoWeAreContent = InitialData["content"];
type WhoWeAreValue = InitialData["values"][number];
type IconName = "target" | "eye" | "sparkles" | "heart" | "hand-heart" | "shield-check";

const valueIcons: Record<IconName, { label: string; icon: LucideIcon }> = {
  target: { label: "Target", icon: Target },
  eye: { label: "Vision", icon: Eye },
  sparkles: { label: "Sparkles", icon: Sparkles },
  heart: { label: "Heart", icon: Heart },
  "hand-heart": { label: "Helping hands", icon: HandHeart },
  "shield-check": { label: "Shield", icon: ShieldCheck },
};

export function WhoWeAreManagement({
  initialContent,
  initialValues,
}: {
  initialContent: WhoWeAreContent;
  initialValues: WhoWeAreValue[];
}) {
  const [values, setValues] = useState(initialValues);
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<WhoWeAreValue | null>(null);
  const [deletingValue, setDeletingValue] = useState<WhoWeAreValue | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleValueSaved = (value: WhoWeAreValue) => {
    setValues((current) => {
      const next = editingValue
        ? current.map((item) => (item.id === value.id ? value : item))
        : [...current, value];
      return next.sort((first, second) => first.sortOrder - second.sortOrder);
    });
    setValueDialogOpen(false);
    setEditingValue(null);
  };

  const handleDeleteValue = async () => {
    if (!deletingValue) return;
    setIsDeleting(true);
    try {
      const result = await deleteWhoWeAreValue(deletingValue.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setValues((current) => current.filter((value) => value.id !== deletingValue.id));
      setDeletingValue(null);
      toast.success("About card deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the About card.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreate = () => {
    setEditingValue(null);
    setValueDialogOpen(true);
  };

  const openEdit = (value: WhoWeAreValue) => {
    setEditingValue(value);
    setValueDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <WhoWeAreContentForm
        key={initialContent.id}
        initialContent={initialContent}
      />

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Mission, vision & values</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add, edit, and remove the cards displayed on the public About section.
            </p>
          </div>
          <Button
            disabled={values.length >= 3}
            onClick={() => {
              openCreate();
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {values.length >= 3 ? "Maximum of 3 cards" : "Add card"}
          </Button>
        </div>

        {values.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {values.map((value) => {
              const Icon = valueIcons[value.icon as IconName]?.icon ?? Sparkles;
              return (
                <article
                  key={value.id}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-blue text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{value.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {value.text}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Position {value.sortOrder + 1} · {valueIcons[value.icon as IconName]?.label ?? "Sparkles"} icon
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(value)}
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingValue(value)}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <Info className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No About cards yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a Mission, Vision, or value card to the public section.
            </p>
          </div>
        )}
      </section>

      {valueDialogOpen && (
        <WhoWeAreValueDialog
          key={editingValue?.id ?? "new"}
          open={valueDialogOpen}
          onOpenChange={setValueDialogOpen}
          value={editingValue}
          defaultPosition={values.length}
          onSaved={handleValueSaved}
        />
      )}

      <AlertDialog
        open={!!deletingValue}
        onOpenChange={(open) => !open && setDeletingValue(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this About card?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes “{deletingValue?.title}” from the public Who We Are section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteValue();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete card"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function WhoWeAreContentForm({
  initialContent,
}: {
  initialContent: WhoWeAreContent;
}) {
  const [heading, setHeading] = useState(initialContent.heading);
  const [description, setDescription] = useState(initialContent.description);
  const [imageUrl, setImageUrl] = useState(initialContent.imageUrl);
  const [savedImageUrl, setSavedImageUrl] = useState(initialContent.imageUrl);
  const [replacementOriginalUrl, setReplacementOriginalUrl] = useState<string | null>(null);
  const [yearsExperience, setYearsExperience] = useState(
    String(initialContent.yearsExperience),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const isSavingRef = useRef(false);
  const isDiscardingRef = useRef(false);
  const pendingDiscards = useRef(0);
  const uploadGeneration = useRef(0);
  const operationQueue = useRef(Promise.resolve());

  const withOperationLock = async <T,>(operation: () => Promise<T>) => {
    let release!: () => void;
    const previousOperation = operationQueue.current;
    operationQueue.current = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previousOperation;
    try {
      return await operation();
    } finally {
      release();
    }
  };

  const discardUploadedImage = async (url: string) => {
    pendingDiscards.current += 1;
    isDiscardingRef.current = true;
    setIsDiscarding(true);
    try {
      const result = await withOperationLock(() => discardWhoWeAreImageUpload(url));
      if (!result.success) toast.warning(result.error);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove the uploaded image.");
    } finally {
      pendingDiscards.current -= 1;
      isDiscardingRef.current = pendingDiscards.current > 0;
      setIsDiscarding(isDiscardingRef.current);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSavingRef.current || isDiscardingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    try {
      await withOperationLock(async () => {
        const result = await updateWhoWeAre({
          heading,
          description,
          imageUrl,
          expectedImageUrl: savedImageUrl,
          yearsExperience: Number(yearsExperience),
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setSavedImageUrl(result.content.imageUrl);
        setReplacementOriginalUrl(null);
        toast.success("Who We Are content updated.");
        if (result.warning) toast.warning(result.warning);
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save Who We Are content.");
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const cancelImageReplacement = async () => {
    if (!replacementOriginalUrl || isSavingRef.current || isDiscardingRef.current) return;
    const uploadedReplacementUrl = imageUrl;
    uploadGeneration.current += 1;
    setImageUrl(replacementOriginalUrl);
    setReplacementOriginalUrl(null);

    if (uploadedReplacementUrl && uploadedReplacementUrl !== replacementOriginalUrl) {
      await discardUploadedImage(uploadedReplacementUrl);
    }
  };

  const currentUploadGeneration = uploadGeneration.current;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Main content</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This heading, description, photo, and experience badge appear on both public pages.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="who-we-are-heading">Heading</Label>
              <Input
                id="who-we-are-heading"
                value={heading}
                onChange={(event) => setHeading(event.target.value)}
                maxLength={160}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="who-we-are-description">Description</Label>
              <Textarea
                id="who-we-are-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={2000}
                rows={7}
                required
              />
            </div>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="who-we-are-years">Years of experience badge</Label>
              <Input
                id="who-we-are-years"
                type="number"
                min={1}
                max={200}
                value={yearsExperience}
                onChange={(event) => setYearsExperience(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Who We Are image</Label>
            {imageUrl ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={imageUrl}
                  alt="Who We Are section preview"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-3 right-3"
                  onClick={() => {
                    if (isSavingRef.current || isDiscardingRef.current) return;
                    const supersededUrl = imageUrl;
                    uploadGeneration.current += 1;
                    setReplacementOriginalUrl((current) => current ?? savedImageUrl);
                    setImageUrl("");
                    if (supersededUrl !== savedImageUrl) {
                      void discardUploadedImage(supersededUrl);
                    }
                  }}
                  disabled={isSaving || isDiscarding}
                >
                  Replace image
                </Button>
                {replacementOriginalUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute bottom-3 left-3"
                    onClick={() => void cancelImageReplacement()}
                    disabled={isSaving || isDiscarding}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ) : (
              isDiscarding ? (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Removing the previous replacement...
                </p>
              ) : (
                <UploadDropzone
                  endpoint="whoWeAreImage"
                  onClientUploadComplete={(files) => {
                    const url = files[0]?.ufsUrl;
                    if (!url) return;
                    if (uploadGeneration.current !== currentUploadGeneration) {
                      void discardUploadedImage(url);
                      return;
                    }
                    setImageUrl(url);
                    toast.success("Image uploaded.");
                  }}
                  onUploadError={(error) => {
                    if (uploadGeneration.current === currentUploadGeneration) {
                      toast.error(error.message);
                    }
                  }}
                  config={{ mode: "auto" }}
                  appearance={{
                    container: "border-border bg-muted/30",
                    label: "text-foreground",
                    button: uploadDropzoneButtonClassName,
                  }}
                />
              )
            )}
            {replacementOriginalUrl && !imageUrl && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => void cancelImageReplacement()}
                disabled={isSaving || isDiscarding}
              >
                Cancel image replacement
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-5">
          <Button type="submit" disabled={isSaving || isDiscarding || !imageUrl}>
            {isSaving ? "Saving..." : isDiscarding ? "Removing image..." : "Save main content"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function WhoWeAreValueDialog({
  open,
  onOpenChange,
  value,
  defaultPosition,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: WhoWeAreValue | null;
  defaultPosition: number;
  onSaved: (value: WhoWeAreValue) => void;
}) {
  const [title, setTitle] = useState(value?.title ?? "");
  const [text, setText] = useState(value?.text ?? "");
  const [icon, setIcon] = useState<IconName>(
    (value?.icon as IconName) in valueIcons ? (value?.icon as IconName) : "sparkles",
  );
  const [position, setPosition] = useState(
    String((value?.sortOrder ?? defaultPosition) + 1),
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        title,
        text,
        icon,
        sortOrder: Number(position) - 1,
      };
      const result = value
        ? await updateWhoWeAreValue(value.id, payload)
        : await createWhoWeAreValue(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onSaved(result.value);
      toast.success(value ? "About card updated." : "About card added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save About card.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{value ? "Edit About card" : "Add About card"}</DialogTitle>
          <DialogDescription>
            Add a Mission, Vision, or values card to the public Who We Are section.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="who-we-are-value-title">Title</Label>
            <Input
              id="who-we-are-value-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={80}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="who-we-are-value-text">Description</Label>
            <Textarea
              id="who-we-are-value-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={600}
              rows={4}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="who-we-are-value-icon">Icon</Label>
              <select
                id="who-we-are-value-icon"
                value={icon}
                onChange={(event) => setIcon(event.target.value as IconName)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {Object.entries(valueIcons).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="who-we-are-value-position">Display position</Label>
              <Input
                id="who-we-are-value-position"
                type="number"
                min={1}
                max={100}
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : value ? "Save changes" : "Add card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
