"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  createTeamProfile,
  deleteTeamProfile,
  toggleTeamProfilePublish,
  updateTeamProfile,
  type getAdminTeamManagementData,
} from "@/actions/team";
import {
  UploadDropzone,
  uploadDropzoneButtonClassName,
} from "@/lib/uploadthing";
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

type TeamManagementData = Awaited<ReturnType<typeof getAdminTeamManagementData>>;
type TeamProfileRecord = TeamManagementData["profiles"][number];
type VisibilityFilter = "all" | "published" | "drafts";

export function TeamManagement({
  initialData,
}: {
  initialData: TeamManagementData;
}) {
  const [profiles, setProfiles] = useState(initialData.profiles);
  const [users] = useState(initialData.users);
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<TeamProfileRecord | null>(null);
  const [viewingProfile, setViewingProfile] = useState<TeamProfileRecord | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<TeamProfileRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pageSize = 12;

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return profiles.filter((profile) => {
      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "published" && profile.published) ||
        (visibilityFilter === "drafts" && !profile.published);
      const matchesQuery =
        !normalizedQuery ||
        `${profile.name} ${profile.designation} ${profile.biography} ${profile.department ?? ""}`
          .toLocaleLowerCase()
          .includes(normalizedQuery);
      return matchesVisibility && matchesQuery;
    });
  }, [profiles, query, visibilityFilter]);
  const {
    currentPage,
    pageCount,
    pageItems,
    setPage,
    resetPage,
  } = useClientPagination(filteredProfiles, pageSize);

  const openCreate = () => {
    setEditingProfile(null);
    setFormOpen(true);
  };

  const openEdit = (profile: TeamProfileRecord) => {
    setEditingProfile(profile);
    setFormOpen(true);
  };

  const handleSaved = (profile: TeamProfileRecord, warning?: string) => {
    setProfiles((current) =>
      editingProfile
        ? current.map((existing) => (existing.id === profile.id ? profile : existing))
        : [...current, profile],
    );
    if (!editingProfile) resetPage();
    setFormOpen(false);
    setEditingProfile(null);
    toast.success(editingProfile ? "Team profile updated." : "Team profile created.");
    if (warning) toast.warning(warning);
  };

  const handleTogglePublish = (profile: TeamProfileRecord) => {
    startTransition(async () => {
      try {
        const result = await toggleTeamProfilePublish(profile.id);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setProfiles((current) =>
          current.map((item) =>
            item.id === profile.id ? { ...item, published: result.published } : item,
          ),
        );
        toast.success(result.published ? "Profile published." : "Profile unpublished.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not change profile visibility.");
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingProfile) return;
    setIsDeleting(true);
    try {
      const result = await deleteTeamProfile(deletingProfile.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setProfiles((current) => current.filter((item) => item.id !== deletingProfile.id));
      toast.success(`"${result.name}" deleted.`);
      if (result.warning) toast.warning(result.warning);
      setDeletingProfile(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete team profile.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total profiles" value={profiles.length} />
        <StatCard
          label="Published"
          value={profiles.filter((profile) => profile.published).length}
          valueClass="text-emerald-600"
        />
        <StatCard
          label="Drafts"
          value={profiles.filter((profile) => !profile.published).length}
          valueClass="text-amber-600"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative sm:max-w-sm sm:flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetPage();
                }}
                placeholder="Search team profiles..."
                aria-label="Search team profiles"
                className="pl-9"
              />
            </div>
            <select
              aria-label="Filter team profiles by publication status"
              value={visibilityFilter}
              onChange={(event) => {
                setVisibilityFilter(event.target.value as VisibilityFilter);
                resetPage();
              }}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All visibility</option>
              <option value="published">Published</option>
              <option value="drafts">Drafts</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={openCreate} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Add team member
            </Button>
          </div>
        </div>
      </div>

      {filteredProfiles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((profile) => (
            <article
              key={profile.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={profile.imageUrl}
                  alt={profile.name}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <Badge
                  className="absolute left-3 top-3"
                  variant={profile.published ? "default" : "secondary"}
                >
                  {profile.published ? "Published" : "Draft"}
                </Badge>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.designation}</p>
                  {profile.department && (
                    <p className="mt-1 text-xs text-muted-foreground">{profile.department}</p>
                  )}
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {profile.biography}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button size="sm" variant="outline" onClick={() => setViewingProfile(profile)}>
                    View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(profile)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleTogglePublish(profile)}
                  >
                    {profile.published ? (
                      <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {profile.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeletingProfile(profile)}
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
          <Users className="mx-auto h-9 w-9 text-muted-foreground" />
          <p className="mt-3 font-medium">No team profiles found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a profile or adjust your search and filters.
          </p>
        </div>
      )}

      <ListPagination
        currentPage={currentPage}
        pageCount={pageCount}
        totalItems={filteredProfiles.length}
        pageSize={pageSize}
        itemLabel="profiles"
        onPageChange={setPage}
      />

      {formOpen && (
        <TeamProfileDialog
          key={editingProfile?.id ?? "new"}
          open={formOpen}
          onOpenChange={setFormOpen}
          profile={editingProfile}
          users={users}
          onSaved={handleSaved}
        />
      )}

      <TeamProfileDetails
        profile={viewingProfile}
        onOpenChange={(open) => !open && setViewingProfile(null)}
      />

      <AlertDialog
        open={!!deletingProfile}
        onOpenChange={(open) => !open && setDeletingProfile(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this team profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {deletingProfile?.name}&apos;s public profile. Its uploaded
              image will also be removed when no other record uses it.
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
              {isDeleting ? "Deleting..." : "Delete profile"}
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

function TeamProfileDialog({
  open,
  onOpenChange,
  profile,
  users,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: TeamProfileRecord | null;
  users: TeamManagementData["users"];
  onSaved: (profile: TeamProfileRecord, warning?: string) => void;
}) {
  const [name, setName] = useState(profile?.name ?? "");
  const [userId, setUserId] = useState(profile?.userId ?? "");
  const [designation, setDesignation] = useState(profile?.designation ?? "");
  const [biography, setBiography] = useState(profile?.biography ?? "");
  const [imageUrl, setImageUrl] = useState(profile?.imageUrl ?? "");
  const [department, setDepartment] = useState(profile?.department ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagramUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(profile?.facebookUrl ?? "");
  const [sortOrder, setSortOrder] = useState(String(profile?.sortOrder ?? 0));
  const [published, setPublished] = useState(profile?.published ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageUrl) {
      toast.error("Upload a profile image before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        userId,
        designation,
        biography,
        imageUrl,
        department,
        linkedinUrl,
        instagramUrl,
        facebookUrl,
        sortOrder: Number(sortOrder),
        published,
      };
      const result = profile
        ? await updateTeamProfile(profile.id, payload)
        : await createTeamProfile(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onSaved(result.profile, "warning" in result && typeof result.warning === "string" ? result.warning : undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save team profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{profile ? "Edit team profile" : "Add team profile"}</DialogTitle>
          <DialogDescription>
              Keep one profile per person and include overlapping responsibilities in the designation.
              Linking an account does not change its access or volunteer role.
            </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Profile image</Label>
            {imageUrl ? (
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={imageUrl}
                  alt={name || "Team profile image preview"}
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
                endpoint="teamProfileImage"
                onClientUploadComplete={(files) => {
                  const uploadedUrl = files[0]?.ufsUrl;
                  if (uploadedUrl) {
                    setImageUrl(uploadedUrl);
                    toast.success("Profile image uploaded.");
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" id="team-profile-name">
              <Input
                id="team-profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                required
              />
            </Field>
            <Field label="Designation" id="team-profile-designation">
              <Input
                id="team-profile-designation"
                value={designation}
                onChange={(event) => setDesignation(event.target.value)}
                maxLength={160}
                required
              />
            </Field>
          </div>

          <Field label="Link existing account (optional)" id="team-profile-user">
            <select
              id="team-profile-user"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">No linked account</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              An account can be linked to one team profile. No account contact details are
              published.
            </p>
          </Field>

          <Field label="Department (optional)" id="team-profile-department">
            <Input
              id="team-profile-department"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              maxLength={120}
            />
          </Field>

          <Field label="Short biography" id="team-profile-biography">
            <Textarea
              id="team-profile-biography"
              value={biography}
              onChange={(event) => setBiography(event.target.value)}
              maxLength={2000}
              rows={5}
              required
            />
            <p className="text-right text-xs text-muted-foreground">{biography.length}/2000</p>
          </Field>

          <div className="space-y-3">
            <p className="text-sm font-medium">Approved social links (optional)</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="LinkedIn" id="team-profile-linkedin">
                <Input
                  id="team-profile-linkedin"
                  type="url"
                  value={linkedinUrl}
                  onChange={(event) => setLinkedinUrl(event.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </Field>
              <Field label="Instagram" id="team-profile-instagram">
                <Input
                  id="team-profile-instagram"
                  type="url"
                  value={instagramUrl}
                  onChange={(event) => setInstagramUrl(event.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </Field>
              <Field label="Facebook" id="team-profile-facebook">
                <Input
                  id="team-profile-facebook"
                  type="url"
                  value={facebookUrl}
                  onChange={(event) => setFacebookUrl(event.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </Field>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display order" id="team-profile-sort-order">
              <Input
                id="team-profile-sort-order"
                type="number"
                min={0}
                max={1_000_000}
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                required
              />
            </Field>
            <CheckboxField
              id="team-profile-published"
              label="Published"
              checked={published}
              onChange={setPublished}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : profile ? "Save changes" : "Create profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TeamProfileDetails({
  profile,
  onOpenChange,
}: {
  profile: TeamProfileRecord | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!profile} onOpenChange={onOpenChange}>
      {profile && (
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{profile.name}</DialogTitle>
            <DialogDescription>
              {profile.designation}
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            <Image src={profile.imageUrl} alt={profile.name} fill className="object-cover" />
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{profile.biography}</p>
          <p className="text-sm text-muted-foreground">
            {[profile.department, `Display order ${profile.sortOrder}`].filter(Boolean).join(" · ")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={profile.published ? "default" : "secondary"}>
              {profile.published ? "Published" : "Draft"}
            </Badge>
          </div>
          <SocialLinks profile={profile} />
        </DialogContent>
      )}
    </Dialog>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-10 items-center gap-2 rounded-md border border-input px-3 text-sm"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      {label}
    </label>
  );
}

function SocialLinks({
  profile,
}: {
  profile: Pick<TeamProfileRecord, "linkedinUrl" | "instagramUrl" | "facebookUrl">;
}) {
  const links = [
    ["LinkedIn", profile.linkedinUrl],
    ["Instagram", profile.instagramUrl],
    ["Facebook", profile.facebookUrl],
  ] as const;
  return (
    <div className="flex flex-wrap gap-3">
      {links.map(([label, url]) =>
        url ? (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {label}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null,
      )}
    </div>
  );
}
