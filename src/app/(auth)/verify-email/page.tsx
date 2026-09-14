"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail, sendVerificationEmail } from "@/lib/auth-client";
import { PageHero } from "@/components/site/SiteLayout";
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { verifyEmailSchema } from "@/validation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const initialEmail = searchParams.get("email") || "";

  const [verifying, setVerifying] = useState(!!token);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState(initialEmail);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    async function handleVerify() {
      try {
        const res = await verifyEmail({
          query: {
            token: token as string,
          },
        });

        if (!isMounted) return;

        if (res?.error) {
          setError(res.error.message || "Failed to verify email address. Token may be invalid or expired.");
        } else {
          setVerified(true);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "An unexpected error occurred during verification.");
        }
      } finally {
        if (isMounted) setVerifying(false);
      }
    }

    handleVerify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleResend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validation = verifyEmailSchema.safeParse({ email: emailInput });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Please enter a valid email address.");
      return;
    }

    setResendLoading(true);
    setResendSent(false);

    try {
      const res = await sendVerificationEmail({
        email: validation.data.email,
        callbackURL: "/dashboard",
      });

      if (res?.error) {
        setError(res.error.message || "Failed to send verification email.");
      } else {
        setResendSent(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setResendLoading(false);
    }
  }

  // State 1: Verifying token from email link
  if (verifying) {
    return (
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl text-center space-y-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Verifying your email...</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we confirm your email address.
          </p>
        </div>
      </div>
    );
  }

  // State 2: Verification Successful
  if (verified) {
    return (
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Email Verified!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you for verifying your email address. Your account is now fully active.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 rounded-xl gradient-blue px-5 py-3 text-sm font-semibold text-primary-foreground shadow-blue transition-transform hover:-translate-y-0.5"
          >
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // State 3: Normal landing / Pending verification / Resend Email UI
  return (
    <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
          <Mail className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Verify Your Email</h2>
        <p className="text-sm text-muted-foreground mt-2">
          We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resendSent && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Verification email sent! Check your inbox.</span>
        </div>
      )}

      <form onSubmit={handleResend} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Resend Verification Link
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={resendLoading || !emailInput}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition disabled:opacity-50"
        >
          {resendLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" /> Resend Verification Email
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already verified?{" "}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <PageHero
        eyebrow="Account Verification"
        title="Email Verification"
        subtitle="Confirm your email address to access all features"
      />
      <section className="section-y container-x flex justify-center">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </section>
    </>
  );
}
