"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  ShieldCheck,
  KeyRound,
  Mail,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  Lock,
  Smartphone,
  Check,
} from "lucide-react";
import { updateUserProfile } from "@/app/(dashboard)/dashboard/profile/profile-actions";
import { authClient } from "@/lib/auth-client";

interface UserProfileViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: string | Date;
  };
}

function getInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserProfileView({ user }: UserProfileViewProps) {
  const [isPending, startTransition] = useTransition();

  // Profile Form State
  const [name, setName] = useState(user.name || "");
  const [savedName, setSavedName] = useState(user.name || "");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    startTransition(async () => {
      const res = await updateUserProfile({ name });
      if (res.success) {
        setSavedName(name);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(error.message || "Failed to change password");
      } else {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("An error occurred while changing password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header Banner */}
      <Card className="border-border shadow-xs overflow-hidden bg-gradient-to-r from-primary/5 via-card to-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-sm shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                {getInitials(savedName)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                  {savedName}
                </h1>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs font-semibold gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Staff Administrator
                </Badge>
                {user.emailVerified && (
                  <Badge variant="secondary" className="text-[11px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-normal gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Account
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  Joined {new Date(user.createdAt).toLocaleDateString("en-PK", { month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-6">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="general" className="gap-1.5 text-xs">
                <User className="w-3.5 h-3.5" /> General Info
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5 text-xs">
                <KeyRound className="w-3.5 h-3.5" /> Security & Password
              </TabsTrigger>
              <TabsTrigger value="session" className="gap-1.5 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> Account Details
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: GENERAL INFO */}
            <TabsContent value="general" className="space-y-6 pt-2">
              <div>
                <h3 className="text-base font-semibold text-foreground">Personal Profile</h3>
                <p className="text-xs text-muted-foreground">
                  Manage your public display name and account details.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    disabled
                    value={user.email}
                    className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Email address is managed by organization admin settings.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isPending || name === savedName}
                    size="sm"
                    className="text-xs gap-1.5 font-semibold"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* TAB 2: SECURITY */}
            <TabsContent value="security" className="space-y-6 pt-2">
              <div>
                <h3 className="text-base font-semibold text-foreground">Password & Credentials</h3>
                <p className="text-xs text-muted-foreground">
                  Update your account password to ensure your account remains secure.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-xs font-semibold">
                    Current Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs font-semibold">
                    New Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                    Confirm New Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    size="sm"
                    className="text-xs gap-1.5 font-semibold"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Change Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* TAB 3: ACCOUNT DETAILS */}
            <TabsContent value="session" className="space-y-6 pt-2">
              <div>
                <h3 className="text-base font-semibold text-foreground">Account & Metadata</h3>
                <p className="text-xs text-muted-foreground">
                  Information regarding your organization account and active session.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <span className="text-muted-foreground block font-medium">User Identifier</span>
                  <code className="font-mono text-[11px] text-foreground block break-all bg-muted p-2 rounded">
                    {user.id}
                  </code>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <span className="text-muted-foreground block font-medium">Authentication Method</span>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Better Auth Credentials / Session
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <span className="text-muted-foreground block font-medium">Role & Permissions</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      Wujood Staff Member
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <span className="text-muted-foreground block font-medium">Account Creation Date</span>
                  <span className="font-semibold text-foreground block">
                    {new Date(user.createdAt).toLocaleString("en-PK")}
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
