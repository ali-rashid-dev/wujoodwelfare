"use client";

import { useState, type ComponentProps, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  BadgeCheck,
  Check,
  Eye,
  Pencil,
  Plus,
  Search,
  Shield,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  changeManagedUserRole,
  changeManagedUserStatus,
  createManagedUser,
  updateManagedUserProfile,
  type getAdminUserManagement,
} from "@/actions/user-management";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListPagination } from "@/components/ui/list-pagination";

type UserManagementData = Awaited<ReturnType<typeof getAdminUserManagement>>;
type ManagedUser = UserManagementData["users"][number];
type ManagedRole = "admin" | "volunteer";

const roleStyles: Record<ManagedRole, string> = {
  admin: "border-primary/30 bg-primary/10 text-primary",
  volunteer: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

const statusStyles = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  deactivated: "border-destructive/30 bg-destructive/10 text-destructive",
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function filtersUrl(
  filters: UserManagementData["filters"],
  page: number,
) {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.role !== "all") params.set("role", filters.role);
  if (filters.status !== "all") params.set("status", filters.status);
  if (page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `/admin/users?${queryString}` : "/admin/users";
}

export function UserManagement({ data }: { data: UserManagementData }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsUser, setDetailsUser] = useState<ManagedUser | null>(null);
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);
  const [roleUser, setRoleUser] = useState<ManagedUser | null>(null);
  const [statusUser, setStatusUser] = useState<ManagedUser | null>(null);
  const [nextRole, setNextRole] = useState<ManagedRole>("volunteer");
  const [pendingAction, setPendingAction] = useState(false);

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPendingAction(true);
    try {
      const result = await createManagedUser({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setCreateOpen(false);
      toast.success(
        result.verificationEmailSent
          ? "Account created. A verification email was sent."
          : "Account created, but the verification email could not be sent.",
      );
      router.refresh();
    } catch (error) {
      console.error("Create user request failed:", error);
      toast.error("Could not create this account.");
    } finally {
      setPendingAction(false);
    }
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editUser) return;
    const formData = new FormData(event.currentTarget);
    setPendingAction(true);
    try {
      const result = await updateManagedUserProfile({
        userId: editUser.id,
        name: formData.get("name"),
        image: formData.get("image"),
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setEditUser(null);
      toast.success("User profile updated.");
      router.refresh();
    } catch (error) {
      console.error("User profile update request failed:", error);
      toast.error("Could not update this user profile.");
    } finally {
      setPendingAction(false);
    }
  }

  async function submitRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roleUser) return;
    setPendingAction(true);
    try {
      const result = await changeManagedUserRole(roleUser.id, nextRole);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setRoleUser(null);
      toast.success(
        result.changed
          ? "Role updated. The user's active sessions were signed out."
          : "This user already has that role.",
      );
      router.refresh();
    } catch (error) {
      console.error("User role update request failed:", error);
      toast.error("Could not change this user's role.");
    } finally {
      setPendingAction(false);
    }
  }

  async function confirmStatusChange() {
    if (!statusUser) return;
    const nextStatus =
      statusUser.accountStatus === "active" ? "deactivated" : "active";
    setPendingAction(true);
    try {
      const result = await changeManagedUserStatus(statusUser.id, nextStatus);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setStatusUser(null);
      toast.success(
        result.changed
          ? nextStatus === "active"
            ? "Account activated."
            : "Account deactivated and active sessions revoked."
          : `Account is already ${nextStatus}.`,
      );
      router.refresh();
    } catch (error) {
      console.error("User account status request failed:", error);
      toast.error("Could not change this user's account status.");
    } finally {
      setPendingAction(false);
    }
  }

  const summaryCards = [
    { label: "Total users", value: data.stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Active accounts", value: data.stats.activeUsers, icon: BadgeCheck, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Deactivated", value: data.stats.deactivatedUsers, icon: X, color: "text-destructive" },
    { label: "Administrators", value: data.stats.admins, icon: Shield, color: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Users className="h-3.5 w-3.5" />
          Administrative Console
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              User Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Manage account profiles, access roles, and account status. Existing
              assignments and authentication records are retained.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> Create account
          </Button>
        </div>
      </div>

      <section aria-label="User statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <Icon className={`h-4 w-4 shrink-0 ${color}`} />
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Accounts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, filter, and manage existing accounts.
          </p>
        </div>

        <form
          action="/admin/users"
          method="get"
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="query"
              defaultValue={data.filters.query}
              placeholder="Search name or email"
              aria-label="Search users by name or email"
              className="pl-9"
            />
          </div>
          <select
            name="role"
            defaultValue={data.filters.role}
            aria-label="Filter users by role"
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="all">All roles</option>
            <option value="admin">Administrator</option>
            <option value="volunteer">Volunteer</option>
          </select>
          <select
            name="status"
            defaultValue={data.filters.status}
            aria-label="Filter users by account status"
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </select>
          <Button type="submit" variant="secondary">
            Apply filters
          </Button>
          <Button type="reset" variant="ghost" nativeButton={false} render={<Link href="/admin/users" />}>
            Clear
          </Button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {data.users.length === 0 ? (
            <div className="p-10 text-center">
              <UserRound className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-3 font-semibold">
                {data.pagination.total === 0 ? "No users found" : "No matching users"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.pagination.total === 0
                  ? "There are no accounts matching these filters."
                  : "Try another search or adjust the role and status filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Account status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex min-w-52 items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.image ?? undefined} alt="" />
                          <AvatarFallback>{initials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleStyles[user.role]}>
                        {user.role === "admin" ? "Administrator" : "Volunteer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[user.accountStatus]}>
                        {user.accountStatus === "active" ? "Active" : "Deactivated"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(user.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`View ${user.name}`}
                          title="View details"
                          onClick={() => setDetailsUser(user)}
                        >
                          <Eye />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${user.name}`}
                          title="Edit profile"
                          onClick={() => setEditUser(user)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Change role for ${user.name}`}
                          title="Change role"
                          onClick={() => {
                            setNextRole(user.role);
                            setRoleUser(user);
                          }}
                        >
                          <Shield />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`${user.accountStatus === "active" ? "Deactivate" : "Activate"} ${user.name}`}
                          title={user.accountStatus === "active" ? "Deactivate account" : "Activate account"}
                          onClick={() => setStatusUser(user)}
                        >
                          {user.accountStatus === "active" ? <X /> : <Check />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {data.pagination.total > 0 && (
          <ListPagination
            currentPage={data.pagination.page}
            pageCount={data.pagination.pageCount}
            totalItems={data.pagination.total}
            pageSize={data.pagination.pageSize}
            itemLabel="users"
            onPageChange={(page) => router.push(filtersUrl(data.filters, page))}
          />
        )}
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create account</DialogTitle>
            <DialogDescription>
              Create a volunteer account using Wujood Welfare authentication.
              A verification email will be sent to the new user.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCreate} className="space-y-4">
            <Field label="Full name" name="name" required autoComplete="name" />
            <Field label="Email address" name="email" type="email" required autoComplete="email" />
            <Field
              label="Temporary password"
              name="password"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              description="At least 12 characters. Share this securely with the new user."
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pendingAction}>
                {pendingAction ? "Creating..." : "Create account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailsUser} onOpenChange={(open) => !open && setDetailsUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription>
              Account profile and associated work history.
            </DialogDescription>
          </DialogHeader>
          {detailsUser && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={detailsUser.image ?? undefined} alt="" />
                  <AvatarFallback>{initials(detailsUser.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold">{detailsUser.name}</p>
                  <p className="break-all text-sm text-muted-foreground">{detailsUser.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={roleStyles[detailsUser.role]}>
                  {detailsUser.role === "admin" ? "Administrator" : "Volunteer"}
                </Badge>
                <Badge variant="outline" className={statusStyles[detailsUser.accountStatus]}>
                  {detailsUser.accountStatus === "active" ? "Active" : "Deactivated"}
                </Badge>
                <Badge variant="outline">
                  {detailsUser.emailVerified ? "Email verified" : "Email not verified"}
                </Badge>
              </div>
              <dl className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 text-sm sm:grid-cols-2">
                <Detail label="Account created" value={format(detailsUser.createdAt, "MMM d, yyyy 'at' h:mm a")} />
                <Detail label="Last updated" value={format(detailsUser.updatedAt, "MMM d, yyyy 'at' h:mm a")} />
                <Detail label="Assignments" value={String(detailsUser._count.assignments)} />
                <Detail label="Account ID" value={detailsUser.id} />
                {detailsUser.banExpires && detailsUser.banned && (
                  <Detail label="Deactivation expires" value={format(detailsUser.banExpires, "MMM d, yyyy")} />
                )}
              </dl>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDetailsUser(null)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update the user&apos;s display name and profile image. Email and
              authentication credentials are managed by the account owner.
            </DialogDescription>
          </DialogHeader>
          {editUser && (
            <form key={editUser.id} onSubmit={submitProfile} className="space-y-4">
              <Field label="Full name" name="name" defaultValue={editUser.name} required />
              <Field
                label="Profile image URL"
                name="image"
                type="url"
                defaultValue={editUser.image ?? ""}
                description="Leave blank to remove the current profile image."
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pendingAction}>
                  {pendingAction ? "Saving..." : "Save profile"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!roleUser} onOpenChange={(open) => !open && setRoleUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change user role</DialogTitle>
            <DialogDescription>
              Role changes are separately authorized and revoke the user&apos;s
              current sessions. You cannot change your own role.
            </DialogDescription>
          </DialogHeader>
          {roleUser && (
            <form onSubmit={submitRole} className="space-y-4">
              <p className="text-sm font-medium">{roleUser.name}</p>
              <div className="space-y-2">
                <Label htmlFor="managed-user-role">Role</Label>
                <select
                  id="managed-user-role"
                  value={nextRole}
                  onChange={(event) => setNextRole(event.target.value as ManagedRole)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRoleUser(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pendingAction}>
                  {pendingAction ? "Saving..." : "Save role"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!statusUser} onOpenChange={(open) => !open && setStatusUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusUser?.accountStatus === "active" ? "Deactivate account?" : "Activate account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusUser?.accountStatus === "active"
                ? `Deactivate ${statusUser.name}? They will be signed out, and their existing assignments and account history will be retained.`
                : `Restore account access for ${statusUser?.name}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingAction}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant={statusUser?.accountStatus === "active" ? "destructive" : "default"}
              disabled={pendingAction}
              onClick={confirmStatusChange}
            >
              {pendingAction
                ? "Updating..."
                : statusUser?.accountStatus === "active"
                  ? "Deactivate account"
                  : "Activate account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({
  label,
  name,
  description,
  ...inputProps
}: {
  label: string;
  name: string;
  description?: string;
} & ComponentProps<typeof Input>) {
  const descriptionId = description ? `${name}-description` : undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} aria-describedby={descriptionId} {...inputProps} />
      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-all font-medium">{value}</dd>
    </div>
  );
}
