import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MessageCircle } from "lucide-react";
import { PageEntrance } from "@/components/motion/PageEntrance";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-lg bg-card px-4 py-2 font-semibold text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-16 md:pt-20">
        <PageEntrance>{children}</PageEntrance>
      </main>
      <Footer />
      <a
        href="https://wa.me/923295941457"
        aria-label="Contact Wujood Welfare on WhatsApp"
        className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-lg bg-[#28734D] text-white shadow-md transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
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
    <section className="border-b border-border bg-accent/50 text-foreground">
      <div className="container-x py-16 md:py-20">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
