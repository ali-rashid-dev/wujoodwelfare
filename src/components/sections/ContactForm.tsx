"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContactMessage } from "@/actions/contact";
import {
  initialContactSubmissionState,
  type ContactFormField,
} from "@/validation";

const fields: { name: ContactFormField; label: string; type: string }[] = [
  { name: "name", label: "Your Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone (optional)", type: "tel" },
  { name: "subject", label: "Subject", type: "text" },
];

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactMessage,
    initialContactSubmissionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-border bg-card p-8 md:p-10"
    >
      <h2 className="text-xl font-semibold">Send us a message</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We’ll review your message and get back to you as soon as we can.
      </p>

      <label
        htmlFor="contact-website"
        className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        Leave this field empty
      </label>
      <input
        id="contact-website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[10000px] h-px w-px"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {fields.map(({ name, label, type }) => (
          <div key={name} className={name === "phone" || name === "subject" ? "md:col-span-2" : ""}>
            <label htmlFor={`contact-${name}`} className="text-sm font-medium">
              {label}
              {name !== "phone" && <span aria-hidden="true" className="text-destructive"> *</span>}
            </label>
            <input
              id={`contact-${name}`}
              name={name}
              type={type}
              required={name !== "phone"}
              defaultValue={state.fieldValues[name]}
              maxLength={name === "name" ? 100 : name === "email" ? 254 : name === "subject" ? 160 : 40}
              aria-invalid={Boolean(state.fieldErrors[name])}
              aria-describedby={state.fieldErrors[name] ? `contact-${name}-error` : undefined}
              className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-invalid:border-destructive"
            />
            {state.fieldErrors[name] && (
              <p id={`contact-${name}-error`} className="mt-1 text-xs text-destructive">
                {state.fieldErrors[name]}
              </p>
            )}
          </div>
        ))}

        <div className="md:col-span-2">
          <label htmlFor="contact-message" className="text-sm font-medium">
            Message<span aria-hidden="true" className="text-destructive"> *</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={5}
            defaultValue={state.fieldValues.message}
            aria-invalid={Boolean(state.fieldErrors.message)}
            aria-describedby={state.fieldErrors.message ? "contact-message-error" : undefined}
            className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-invalid:border-destructive"
          />
          {state.fieldErrors.message && (
            <p id="contact-message-error" className="mt-1 text-xs text-destructive">
              {state.fieldErrors.message}
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
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
