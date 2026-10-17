"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Heart, User } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/projects", label: "Projects" },
  { to: "/gallery", label: "Gallery" },
  { to: "/our-team", label: "Our Team" },
  { to: "/volunteer", label: "Volunteer" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const path = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-150 ${
        scrolled
          ? "border-border bg-background shadow-sm"
          : "border-transparent bg-background"
      }`}
    >
      <nav aria-label="Main navigation" className="container-x flex h-16 md:h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-secondary sm:h-11 sm:w-11">
            <Image
              src="/logo.jpg"
              alt=""
              width={150}
              height={150}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base md:text-lg font-bold tracking-tight text-primary">
              Wujood Welfare
            </span>
            <span className="text-[10px] md:text-xs text-muted-foreground tracking-wider">
              Zindagi Ko Wujood Do
            </span>
          </span>
        </Link>

        <ul className="hidden xl:flex items-center gap-1">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <li key={l.to}>
                <Link
                  href={l.to}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "text-primary" : "text-foreground/80 hover:text-primary"
                  } focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                >
                  {l.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-secondary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <User className="h-4 w-4" /> Dashboard
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <User className="h-4 w-4" /> Sign In
            </Link>
          )}

          <Link
            href="/donate"
            className="hidden sm:inline-flex min-h-10 items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Heart className="h-4 w-4" /> Donate Now
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((v) => !v)}
            className="xl:hidden grid h-10 w-10 place-items-center rounded-lg border border-border bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-navigation" className="xl:hidden border-t border-border bg-background">
          <ul className="container-x py-4 flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  href={l.to}
                  aria-current={path === l.to ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block min-h-11 rounded-lg px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    path === l.to ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-border mt-2">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold bg-primary/10 text-primary"
                >
                  Dashboard ({session.user.name || session.user.email})
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center rounded-md border border-border px-3 py-2 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </li>
            <li>
              <Link
                href="/donate"
                onClick={() => setOpen(false)}
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Heart className="h-4 w-4" /> Donate Now
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
