"use client";

import { useActionState, useState } from "react";
import { submitVolunteerApplication } from "@/actions/volunteers";
import type { VolunteerApplicationState } from "@/actions/volunteers";
import { volunteerApplicationSchema } from "@/validation";

const initialState: VolunteerApplicationState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  fieldValues: {
    name: "",
    father_name: "",
    email: "",
    phone: "",
    city: "",
    qualification: "",
    gender: "",
    skills: "",
    availability: "",
    statement_of_purpose: "",
  },
};

export function VolunteerApplicationForm() {
  const [state, formAction, isPending] = useActionState(
    submitVolunteerApplication,
    initialState,
  );
  const [sop, setSop] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const wordCount = sop.trim().split(/\s+/).filter(Boolean).length;
  const sopError = wordCount > 200;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const rawData = {
      name: formData.get("name") as string,
      father_name: formData.get("father_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      city: formData.get("city") as string,
      qualification: formData.get("qualification") as string,
      gender: formData.get("gender") as string,
      skills: formData.get("skills") as string,
      availability: formData.get("availability") as string,
      statement_of_purpose: sop,
    };

    const validation = volunteerApplicationSchema.safeParse(rawData);
    if (!validation.success) {
      e.preventDefault();
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0].toString()] = issue.message;
        }
      });
      setFieldErrors(errors);
    }
  };

  return (
    <form
      key={JSON.stringify(state.fieldValues)}
      action={formAction}
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-blue"
    >
      <h3 className="text-xl font-semibold">Volunteer Application</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us about yourself. Once approved, sign in or create an account with
        this email to access the volunteer portal.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field
          label="Full Name"
          name="name"
          required
          defaultValue={state.fieldValues.name}
          error={fieldErrors.name || state.fieldErrors.name}
        />
        <Field
          label="Father Name"
          name="father_name"
          required
          defaultValue={state.fieldValues.father_name}
          error={fieldErrors.father_name || state.fieldErrors.father_name}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          defaultValue={state.fieldValues.email}
          error={fieldErrors.email || state.fieldErrors.email}
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          required
          defaultValue={state.fieldValues.phone}
          error={fieldErrors.phone || state.fieldErrors.phone}
        />
        <Field
          label="City"
          name="city"
          required
          defaultValue={state.fieldValues.city}
          error={fieldErrors.city || state.fieldErrors.city}
        />
        <Field
          label="Qualification"
          name="qualification"
          required
          defaultValue={state.fieldValues.qualification}
          error={fieldErrors.qualification || state.fieldErrors.qualification}
        />

        <div>
          <label className="text-sm font-medium">Gender</label>
          <select
            required
            name="gender"
            defaultValue={state.fieldValues.gender}
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          {(fieldErrors.gender || state.fieldErrors.gender) && (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.gender || state.fieldErrors.gender}</p>
          )}
        </div>

        <Field
          label="Skills"
          name="skills"
          defaultValue={state.fieldValues.skills}
          placeholder="Teaching, medical, logistics…"
          className="md:col-span-2"
          error={fieldErrors.skills || state.fieldErrors.skills}
        />

        <div className="md:col-span-2">
          <label className="text-sm font-medium">Availability</label>
          <select
            required
            name="availability"
            defaultValue={state.fieldValues.availability}
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select availability</option>
            <option>Weekends only</option>
            <option>Weekdays evenings</option>
            <option>Full week</option>
            <option>One-off events</option>
          </select>
          {(fieldErrors.availability || state.fieldErrors.availability) && (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.availability || state.fieldErrors.availability}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium">
            Statement of Purpose{" "}
            <span className="text-xs text-muted-foreground">
              ({wordCount}/200 words)
            </span>
          </label>

          <textarea
            name="statement_of_purpose"
            required
            rows={5}
            defaultValue={state.fieldValues.statement_of_purpose}
            onChange={(e) => setSop(e.target.value)}
            placeholder="Explain in about 200 words how you can connect with Wujood Welfare and why you want to join us."
            className="mt-2 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {(sopError || fieldErrors.statement_of_purpose || state.fieldErrors.statement_of_purpose) && (
            <p className="mt-1 text-xs text-destructive">
              {fieldErrors.statement_of_purpose ||
                state.fieldErrors.statement_of_purpose ||
                `Maximum 200 words allowed. Currently ${wordCount} words.`}
            </p>
          )}
        </div>
      </div>

      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`mt-4 text-sm ${state.status === "error" ? "text-destructive" : "text-emerald-700 dark:text-emerald-400"}`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-7 inline-flex items-center gap-2 rounded-full gradient-gold px-7 py-3 text-sm font-semibold text-secondary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
      >
        {isPending ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}

function Field({
  label,
  className,
  error,
  ...rest
}: {
  label: string;
  className?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="text-sm font-medium">{label}</label>

      <input
        {...rest}
        className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
