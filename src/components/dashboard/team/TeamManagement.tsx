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
  createTeamCategory,
  createTeamProfile,
  deleteTeamCategory,
  deleteTeamProfile,
  toggleTeamProfilePublish,
  updateTeamCategory,
  updateTeamProfile,
  type getAdminTeamManagementData,
} from "@/actions/team";
import { TEAM_SECTIONS, TEAM_SECTION_LABELS, type TeamSection } from "@/lib/team";
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

type TeamManagementData = Awaited<ReturnType<typeof getAdminTeamManagementData>>;
type TeamProfileRecord = TeamManagementData["profiles"][number];
type TeamCategoryRecord = TeamManagementData["categories"][number];
type VisibilityFilter = "all" | "published" | "drafts";

export function TeamManagement({
  initialData,
}: {
  initialData: TeamManagementData;
}) {
  const [profiles, setProfiles] = useState(initialData.profiles);
  const [categories, setCategories] = useState(initialData.categories);
  const [users] = useState(initialData.users);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<TeamProfileRecord | null>(null);
  const [viewingProfile, setViewingProfile] = useState<TeamProfileRecord | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<TeamProfileRecord | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pageSize = 12;

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return profiles.filter((profile) => {
      const matchesCategory =
        categoryFilter === "all" || profile.category.id === categoryFilter;
      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "published" && profile.published) ||
        (visibilityFilter === "drafts" && !profile.published);
      const matchesQuery =
        !normalizedQuery ||
        `${profile.name} ${profile.designation} ${profile.biography} ${profile.department ?? ""} ${profile.category.name}`
          .toLocaleLowerCase()
          .includes(normalizedQuery);
      return matchesCategory && matchesVisibility && matchesQuery;
    });
  }, [categoryFilter, profiles, query, visibilityFilter]);
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

  const handleCategoryChange = (category: TeamCategoryRecord, deletedId?: string) => {
    if (deletedId && categoryFilter === deletedId) setCategoryFilter("all");
    setCategories((current) =>
      deletedId
        ? current.filter((item) => item.id !== deletedId)
        : current.some((item) => item.id === category.id)
          ? current.map((item) => (item.id === category.id ? category : item))
          : [...current, category],
    );
    if (!deletedId) {
      setProfiles((current) =>
        current.map((profile) =>
          profile.category.id === category.id ? { ...profile, category } : profile,
        ),
      );
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
              aria-label="Filter team profiles by category"
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                resetPage();
              }}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {TEAM_SECTION_LABELS[category.section]} / {category.name}
                </option>
              ))}
            </select>
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
            <Button variant="outline" onClick={() => setCategoriesOpen(true)}>
              Manage categories
            </Button>
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
                {profile.featured && (
                  <Badge className="absolute right-3 top-3" variant="outline">
                    Featured
                  </Badge>
                )}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.designation}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {TEAM_SECTION_LABELS[profile.category.section]} / {profile.category.name}
                    {profile.department ? ` · ${profile.department}` : ""}
                  </p>
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
          categories={categories}
          users={users}
          onSaved={handleSaved}
        />
      )}

      <TeamProfileDetails
        profile={viewingProfile}
        onOpenChange={(open) => !open && setViewingProfile(null)}
      />

      <TeamCategoryManager
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
        categories={categories}
        onCategoryChange={handleCategoryChange}
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
  categories,
  users,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: TeamProfileRecord | null;
  categories: TeamCategoryRecord[];
  users: TeamManagementData["users"];
  onSaved: (profile: TeamProfileRecord, warning?: string) => void;
}) {
  const [name, setName] = useState(profile?.name ?? "");
  const [userId, setUserId] = useState(profile?.userId ?? "");
  const [designation, setDesignation] = useState(profile?.designation ?? "");
  const [categoryId, setCategoryId] = useState(profile?.category.id ?? categories[0]?.id ?? "");
  const [biography, setBiography] = useState(profile?.biography ?? "");
  const [imageUrl, setImageUrl] = useState(profile?.imageUrl ?? "");
  const [department, setDepartment] = useState(profile?.department ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagramUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(profile?.facebookUrl ?? "");
  const [sortOrder, setSortOrder] = useState(String(profile?.sortOrder ?? 0));
  const [featured, setFeatured] = useState(profile?.featured ?? false);
  const [published, setPublished] = useState(profile?.published ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageUrl) {
      toast.error("Upload a profile image before saving.");
      return;
    }
    if (!categoryId) {
      toast.error("Create or choose a category before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        userId,
        designation,
        categoryId,
        biography,
        imageUrl,
        department,
        linkedinUrl,
        instagramUrl,
        facebookUrl,
        sortOrder: Number(sortOrder),
        featured,
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
                  button: "bg-primary text-primary-foreground",
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" id="team-profile-category">
              <select
                id="team-profile-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {TEAM_SECTION_LABELS[category.section]} / {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Department (optional)" id="team-profile-department">
              <Input
                id="team-profile-department"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                maxLength={120}
              />
            </Field>
          </div>

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

          <div className="grid gap-4 sm:grid-cols-3">
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
              id="team-profile-featured"
              label="Featured profile"
              checked={featured}
              onChange={setFeatured}
            />
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
            <Button type="submit" disabled={isSaving || categories.length === 0}>
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
              {profile.designation} · {TEAM_SECTION_LABELS[profile.category.section]}
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            <Image src={profile.imageUrl} alt={profile.name} fill className="object-cover" />
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{profile.biography}</p>
          <p className="text-sm text-muted-foreground">
            {profile.category.name}
            {profile.department ? ` · ${profile.department}` : ""}
            {` · Display order ${profile.sortOrder}`}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={profile.published ? "default" : "secondary"}>
              {profile.published ? "Published" : "Draft"}
            </Badge>
            {profile.featured && <Badge variant="outline">Featured</Badge>}
          </div>
          <SocialLinks profile={profile} />
        </DialogContent>
      )}
    </Dialog>
  );
}

function TeamCategoryManager({
  open,
  onOpenChange,
  categories,
  onCategoryChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: TeamCategoryRecord[];
  onCategoryChange: (category: TeamCategoryRecord, deletedId?: string) => void;
}) {
  const [editingCategory, setEditingCategory] = useState<TeamCategoryRecord | null>(null);
  const [name, setName] = useState("");
  const [section, setSection] = useState<TeamSection>("founders");
  const [sortOrder, setSortOrder] = useState("0");
  const [deletingCategory, setDeletingCategory] = useState<TeamCategoryRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setSection("founders");
    setSortOrder("0");
  };

  const editCategory = (category: TeamCategoryRecord) => {
    setEditingCategory(category);
    setName(category.name);
    setSection(category.section);
    setSortOrder(String(category.sortOrder));
  };

  const saveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = { name, section, sortOrder: Number(sortOrder) };
      const result = editingCategory
        ? await updateTeamCategory(editingCategory.id, payload)
        : await createTeamCategory(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onCategoryChange(result.category);
      toast.success(editingCategory ? "Category updated." : "Category created.");
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save category.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeCategory = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      const result = await deleteTeamCategory(deletingCategory.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onCategoryChange(deletingCategory, deletingCategory.id);
      if (editingCategory?.id === deletingCategory.id) resetForm();
      setDeletingCategory(null);
      toast.success("Category deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete category.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) resetForm();
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage team categories</DialogTitle>
            <DialogDescription>
              Categories sit within the five public team sections. Categories with profiles
              assigned cannot be deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {TEAM_SECTION_LABELS[category.section]} · order {category.sortOrder}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => editCategory(category)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeletingCategory(category)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={saveCategory} className="space-y-4 border-t border-border pt-4">
            <h3 className="font-semibold">{editingCategory ? "Edit category" : "Add category"}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Category name" id="team-category-name">
                <Input
                  id="team-category-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={120}
                  required
                />
              </Field>
              <Field label="Public section" id="team-category-section">
                <select
                  id="team-category-section"
                  value={section}
                  onChange={(event) => setSection(event.target.value as TeamSection)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {TEAM_SECTIONS.map((item) => (
                    <option key={item} value={item}>{TEAM_SECTION_LABELS[item]}</option>
                  ))}
                </select>
              </Field>
              <Field label="Category order" id="team-category-sort">
                <Input
                  id="team-category-sort"
                  type="number"
                  min={0}
                  max={1_000_000}
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  required
                />
              </Field>
            </div>
            <DialogFooter>
              {editingCategory && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel edit
                </Button>
              )}
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : editingCategory ? "Save category" : "Add category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(nextOpen) => !nextOpen && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deletingCategory?.name}&quot;? Categories that still have profiles
              assigned cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void removeCategory();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
