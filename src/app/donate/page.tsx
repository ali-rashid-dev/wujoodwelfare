"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { Building2, Smartphone, Copy, Check, Info, Heart } from "lucide-react";
import { toast } from "sonner";

// NOTE: metadata cannot live in a client component.
// Move this into app/donate/metadata.ts or keep page as server component
// and move PaymentCard into separate client component.
export const metadata: Metadata = {
  title: "Donate — Wujood Welfare",
  description:
    "Donate via bank transfer or Easypaisa. Support food, healthcare, education and emergency relief in Pakistan.",
  openGraph: {
    title: "Donate to Wujood Welfare",
    description: "Every rupee goes directly to families in need.",
  },
  alternates: {
    canonical: "/donate",
  },
};

export default function DonatePage() {
  return (
    <SiteLayout>
      <section className="container-x py-10 md:py-14">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] shadow-blue gradient-blue">
          <div className="relative px-6 py-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
              <Heart className="h-3.5 w-3.5" /> Donate Now
            </div>

            <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-white">
              Your kindness, in action.
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base md:text-lg text-white/85">
              Zindagi Ko Wujood Do. Your contribution provides essential aid to
              families in need.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <Reveal>
            <PaymentCard
              icon={Building2}
              title="Bank Transfer"
              accent="primary"
              rows={[
                { label: "Account Title", value: "Hiba" },
                { label: "Bank Name", value: "Allied Bank Limited" },
                { label: "Branch", value: "Faisalabad" },
              ]}
              highlight={{
                label: "Account Number",
                value: "08660010117067100019",
              }}
            />
          </Reveal>

          <Reveal delay={1}>
            <PaymentCard
              icon={Smartphone}
              title="Easypaisa"
              accent="gold"
              rows={[{ label: "Account Title", value: "Huba" }]}
              highlight={{
                label: "Mobile Number",
                value: "0329-5941457",
              }}
              note="After making your donation, please send us a screenshot of the confirmation on WhatsApp."
            />
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}

type Row = {
  label: string;
  value: string;
};

function PaymentCard({
  icon: Icon,
  title,
  accent,
  rows,
  highlight,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  accent: "primary" | "gold";
  rows: Row[];
  highlight: Row;
  note?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        highlight.value.replace(/\s+/g, "")
      );
      setCopied(true);
      toast.success(`${highlight.label} copied`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  const iconWrap =
    accent === "primary"
      ? "bg-primary/10 text-primary"
      : "bg-secondary/15 text-secondary-foreground";

  const highlightBox =
    accent === "primary"
      ? "bg-muted/60 border-border"
      : "bg-secondary/10 border-secondary/30";

  const highlightText =
    accent === "primary" ? "text-primary" : "text-foreground";

  return (
    <div className="h-full rounded-[2rem] border border-border bg-card p-8 md:p-10 shadow-sm transition-all duration-500 hover:shadow-xl card-lift">
      <div className="flex items-center gap-5">
        <div
          className={`grid h-14 w-14 place-items-center rounded-2xl ${iconWrap}`}
        >
          <Icon className="h-7 w-7" />
        </div>

        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <div className="mt-8 space-y-6">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {r.label}
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {r.value}
            </p>
          </div>
        ))}

        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            {highlight.label}
          </div>

          <div
            className={`mt-2 flex items-center justify-between gap-3 rounded-xl border ${highlightBox} p-4`}
          >
            <span
              className={`font-mono text-base md:text-lg font-bold tracking-tight break-all ${highlightText}`}
            >
              {highlight.value}
            </span>

            <button
              onClick={copy}
              aria-label={`Copy ${highlight.label}`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {note && (
          <div className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs md:text-sm leading-relaxed text-muted-foreground">
              {note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
