import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-between p-4 md:p-8">

      {/* Top Navigation & Welfare Branding Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Brand Link */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 overflow-hidden rounded-lg border border-border bg-secondary transition-transform duration-150 group-hover:scale-[1.02]">
            <Image
              src="/logo.jpg"
              alt="Wujood Welfare"
              width={150}
              height={150}
              className="h-full w-full object-cover"
            />
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
