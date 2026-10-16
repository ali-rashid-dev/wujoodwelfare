"use client";

import { useActionState } from "react";
import { updateVolunteerProfile } from "@/actions/volunteer-work";
import type { VolunteerProfileState } from "@/actions/volunteer-work";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: VolunteerProfileState = {
  success: false,
  message: "",
  fieldErrors: {},
};

export function VolunteerProfileForm({
  profile,
}: {
  profile: {
    name: string;
    email: string;
    phone: string | null;
    city: string | null;
    skills: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(
    updateVolunteerProfile,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="text-sm font-medium">Full name</label>
          <Input
            id="profile-name"
            name="name"
            required
            minLength={2}
            maxLength={100}
            defaultValue={profile.name}
            aria-invalid={Boolean(state.fieldErrors.name)}
            className="mt-1.5"
          />
          {state.fieldErrors.name && <FieldError>{state.fieldErrors.name}</FieldError>}
        </div>
        <div>
          <label htmlFor="profile-email" className="text-sm font-medium">Email</label>
          <Input id="profile-email" type="email" value={profile.email} disabled className="mt-1.5" />
          <p className="mt-1 text-xs text-muted-foreground">Email is managed by your sign-in account.</p>
        </div>
        <div>
          <label htmlFor="profile-phone" className="text-sm font-medium">Phone</label>
          <Input
            id="profile-phone"
            name="phone"
            type="tel"
            maxLength={40}
            defaultValue={profile.phone ?? ""}
            aria-invalid={Boolean(state.fieldErrors.phone)}
            className="mt-1.5"
          />
          {state.fieldErrors.phone && <FieldError>{state.fieldErrors.phone}</FieldError>}
        </div>
        <div>
          <label htmlFor="profile-city" className="text-sm font-medium">City</label>
          <Input
            id="profile-city"
            name="city"
            maxLength={100}
            defaultValue={profile.city ?? ""}
            aria-invalid={Boolean(state.fieldErrors.city)}
            className="mt-1.5"
          />
          {state.fieldErrors.city && <FieldError>{state.fieldErrors.city}</FieldError>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="profile-skills" className="text-sm font-medium">Skills and interests</label>
          <Textarea
            id="profile-skills"
            name="skills"
            maxLength={1000}
            rows={4}
            defaultValue={profile.skills ?? ""}
            aria-invalid={Boolean(state.fieldErrors.skills)}
            className="mt-1.5"
            placeholder="Tell coordinators what skills or interests you can contribute."
          />
          {state.fieldErrors.skills && <FieldError>{state.fieldErrors.skills}</FieldError>}
        </div>
      </div>

      {state.message && (
        <p
          role={state.success ? "status" : "alert"}
          className={`text-sm ${state.success ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}`}
        >
          {state.message}
        </p>
      )}

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}

function FieldError({ children }: { children: string }) {
  return <p className="mt-1 text-xs text-destructive">{children}</p>;
}
