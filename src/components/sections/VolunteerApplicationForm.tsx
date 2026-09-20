"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { volunteerApplicationSchema } from "@/validation";

export function VolunteerApplicationForm() {
  const [done, setDone] = useState(false);
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
      const firstMessage = validation.error.issues[0]?.message;
      if (firstMessage) {
        toast.error(firstMessage);
      }
      return;
    }

    setDone(true);
    toast.success("Submitting your application…");
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <form
      action="https://formsubmit.co/6dfc1b2a42c4f7ece057e64fbc9d2416"
      method="POST"
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-blue"
    >
      <input
        type="hidden"
        name="_subject"
        value="New volunteer application — Wujood Welfare"
      />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_captcha" value="false" />
      <input
        type="text"
        name="_honey"
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
      />

      <h3 className="text-xl font-semibold">Volunteer Application</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us about yourself — we&apos;ll get back within 48 hours.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Full Name" name="name" required error={fieldErrors.name} />
        <Field label="Father Name" name="father_name" required error={fieldErrors.father_name} />
        <Field label="Email" name="email" type="email" required error={fieldErrors.email} />
        <Field label="Phone" name="phone" type="tel" required error={fieldErrors.phone} />
        <Field label="City" name="city" required error={fieldErrors.city} />
        <Field label="Qualification" name="qualification" required error={fieldErrors.qualification} />

        <div>
          <label className="text-sm font-medium">Gender</label>
          <select
            required
            name="gender"
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          {fieldErrors.gender && (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.gender}</p>
          )}
        </div>

        <Field
          label="Skills"
          name="skills"
          placeholder="Teaching, medical, logistics…"
          className="md:col-span-2"
          error={fieldErrors.skills}
        />

        <div className="md:col-span-2">
          <label className="text-sm font-medium">Availability</label>
          <select
            required
            name="availability"
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select availability</option>
            <option>Weekends only</option>
            <option>Weekdays evenings</option>
            <option>Full week</option>
            <option>One-off events</option>
          </select>
          {fieldErrors.availability && (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.availability}</p>
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
            value={sop}
            onChange={(e) => setSop(e.target.value)}
            placeholder="Explain in about 200 words how you can connect with Wujood Welfare and why you want to join us."
            className="mt-2 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {(sopError || fieldErrors.statement_of_purpose) && (
            <p className="mt-1 text-xs text-destructive">
              {fieldErrors.statement_of_purpose || `Maximum 200 words allowed. Currently ${wordCount} words.`}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="mt-7 inline-flex items-center gap-2 rounded-full gradient-gold px-7 py-3 text-sm font-semibold text-secondary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
      >
        {done ? (
          <>
            <Check className="h-4 w-4" /> Submitted
          </>
        ) : (
          <>Submit Application</>
        )}
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
