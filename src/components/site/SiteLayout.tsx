import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CraftedBy } from "./CraftedBy";
import { MessageCircle } from "lucide-react";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <CraftedBy />
      <Footer />
      <a
        href="https://wa.me/923295941457"
        aria-label="WhatsApp"
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 transition"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden gradient-blue text-primary-foreground">
      <div aria-hidden className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
      <div className="container-x relative py-20 md:py-28 text-center">
        {eyebrow && (
          <span className="inline-block rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-primary-foreground/80">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
