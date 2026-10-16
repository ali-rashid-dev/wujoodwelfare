import { Reveal } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/SiteLayout";
import { getCurrentUser } from "@/lib/auth-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, HandHeart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Join the Wujood Welfare volunteer team in Faisalabad. Help deliver food, run medical camps and support education.",
  openGraph: {
    title: "Volunteer with Wujood Welfare",
    description: "Become the reason someone smiles today.",
  },
  alternates: {
    canonical: "/volunteer",
  },
};

export default async function VolunteerPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "admin" ? "/admin/dashboard" : "/volunteer/status");
  }

  return (
    <>
      <PageHero
        eyebrow="Volunteer"
        title="Become the reason someone smiles today."
        subtitle="Give a few hours. Change a life. Join 100+ volunteers across Pakistan."
      />

      <section className="section-y container-x grid lg:grid-cols-5 gap-10">
        <Reveal className="lg:col-span-2">
          <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-gold text-secondary-foreground shadow-gold">
            <HandHeart className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-2xl md:text-3xl font-bold">
            Why volunteer?
          </h2>

          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {[
              "Be part of a trusted local team",
              "Flexible weekly commitment",
              "Hands-on community work",
              "Training and mentorship",
              "Certificates of contribution",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-secondary text-secondary-foreground mt-0.5">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={1} className="lg:col-span-3">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-blue md:p-10">
            <h3 className="text-xl font-semibold">Apply to volunteer</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in or create an account first. Your volunteer application form
              will be available after you sign in.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/sign-in"
                className="inline-flex rounded-full gradient-gold px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Create an account
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
