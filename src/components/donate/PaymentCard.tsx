"use client";

import { Building2, Check, Copy, Info, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Row = {
  label: string;
  value: string;
};

const icons = {
  building2: Building2,
  smartphone: Smartphone,
} as const;

export function PaymentCard({
  icon,
  title,
  accent,
  rows,
  highlight,
  note,
}: {
  icon: keyof typeof icons;
  title: string;
  accent: "primary" | "gold";
  rows: Row[];
  highlight: Row;
  note?: string;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = icons[icon];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(highlight.value.replace(/\s+/g, ""));
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

  const highlightText = accent === "primary" ? "text-primary" : "text-foreground";

  return (
    <div className="h-full rounded-4xl border border-border bg-card p-8 md:p-10 shadow-sm transition-all duration-500 hover:shadow-xl card-lift">
      <div className="flex items-center gap-5">
        <div className={`grid h-14 w-14 place-items-center rounded-2xl ${iconWrap}`}>
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
            <p className="mt-1 text-lg font-semibold text-foreground">{r.value}</p>
          </div>
        ))}

        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            {highlight.label}
          </div>

          <div className={`mt-2 flex items-center justify-between gap-3 rounded-xl border ${highlightBox} p-4`}>
            <span className={`font-mono text-base md:text-lg font-bold tracking-tight break-all ${highlightText}`}>
              {highlight.value}
            </span>

            <button
              onClick={copy}
              aria-label={`Copy ${highlight.label}`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {note && (
          <div className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs md:text-sm leading-relaxed text-muted-foreground">{note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
