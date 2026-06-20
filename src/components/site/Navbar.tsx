"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X, Heart } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/projects", label: "Projects" },
  { to: "/gallery", label: "Gallery" },
  { to: "/volunteer", label: "Volunteer" },
  { to: "/donate", label: "Donate" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled
          ? "backdrop-blur bg-background/85 border-b border-border shadow-sm"
          : "bg-transparent"
        }`}
    >
      <nav className="container-x flex h-16 md:h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-primary shadow-blue overflow-hidden">
            <Image
              src="/logo.jpg"
              alt="Wujood Welfare"
              width={44}
              height={44}
              className="object-cover"
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

        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <li key={l.to}>
                <Link
                  href={l.to}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${active ? "text-primary" : "text-foreground/80 hover:text-primary"
                    }`}
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
          <Link
            href="/donate"
            className="hidden sm:inline-flex items-center gap-2 rounded-full gradient-gold px-5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            <Heart className="h-4 w-4" /> Donate Now
          </Link>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid h-10 w-10 place-items-center rounded-full border border-border bg-card"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <ul className="container-x py-4 flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  href={l.to}
                  className={`block rounded-md px-3 py-2.5 text-sm font-medium ${path === l.to ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/donate"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full gradient-gold px-5 py-3 text-sm font-semibold text-secondary-foreground"
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
