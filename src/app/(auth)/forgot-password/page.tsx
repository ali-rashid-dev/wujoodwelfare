"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-client";
import { PageHero } from "@/components/site/SiteLayout";
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { forgotPasswordSchema } from "@/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setFieldError(validation.error.issues[0]?.message || "Invalid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await requestPasswordReset({
        email: validation.data.email,
        redirectTo: "/reset-password",
      });

      if (res?.error) {
        setError(res.error.message || "Failed to send reset link. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Account Recovery"
        title="Forgot Password"
        subtitle="Enter your email to receive password reset instructions"
      />
      <section className="section-y container-x flex justify-center">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
          {submitted ? (
            <div className="text-center py-4 space-y-5">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We have sent password reset instructions to <span className="font-semibold text-foreground">{email}</span> if an account exists under that address.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
                >
                  Didn&apos;t receive the email? Try again
                </button>

                <Link
                  href="/sign-in"
                  className="w-full flex items-center justify-center gap-2 rounded-xl gradient-blue px-5 py-3 text-sm font-semibold text-primary-foreground shadow-blue transition-transform hover:-translate-y-0.5"
                >
                  <ArrowLeft className="h-4 w-4" /> Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We will send a reset link to your email address
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  </div>
                  {fieldError && (
                    <p className="mt-1 text-xs text-destructive">{fieldError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl gradient-blue px-5 py-3 text-sm font-semibold text-primary-foreground shadow-blue transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending Reset Link...
                    </>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
