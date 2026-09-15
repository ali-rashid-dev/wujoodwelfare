import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: {
    template: "%s | Wujood Welfare",
    default: "Account Access | Wujood Welfare",
  },
  description: "Access your account, sign up, or recover your password at Wujood Welfare.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-between p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div aria-hidden className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />

      {/* Top Navigation & Welfare Branding Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors bg-card/60 backdrop-blur px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/30"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        {/* Brand Link */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
            <Heart className="h-4 w-4 fill-current" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground">
            Wujood Welfare
          </span>
        </Link>
      </header>

      {/* Central Auth Card Shell */}
      <main className="w-full max-w-md mx-auto my-auto py-8 z-10">
        {children}
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-5xl mx-auto text-center text-[11px] text-muted-foreground z-10 pt-4">
        &copy; {new Date().getFullYear()} Wujood Welfare Organization. Dedicated to human dignity & relief.
      </footer>
    </div>
  );
}
