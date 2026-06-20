"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function VolunteerApplicationForm() {
  const [done, setDone] = useState(false);
  const [sop, setSop] = useState("");

  const wordCount = sop.trim().split(/\s+/).filter(Boolean).length;
  const sopError = wordCount > 200;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (sopError || wordCount === 0) {
      e.preventDefault();
      toast.error(
        sopError
          ? "Statement of Purpose must be 200 words or less."
          : "Statement of Purpose is required."
      );
      return;
    }

    setDone(true);
    toast.success("Submitting your application…");
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <form
      action="https://formsubmit.co/wujoodwelfare@gmail.com"
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
        <Field label="Full Name" name="name" required />
        <Field label="Father Name" name="father_name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone" name="phone" type="tel" required />
        <Field label="City" name="city" required />
        <Field label="Qualification" name="qualification" required />

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
        </div>

        <Field
          label="Skills"
          name="skills"
          placeholder="Teaching, medical, logistics…"
          className="md:col-span-2"
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

          {sopError && (
            <p className="mt-1 text-xs text-destructive">
              Maximum 200 words allowed. Currently {wordCount} words.
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
  ...rest
}: {
  label: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="text-sm font-medium">{label}</label>

      <input
        {...rest}
        className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
