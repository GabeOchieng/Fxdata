"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "./logo";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-line bg-ink-950/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav className="container-content flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-fg"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/hire" className="text-sm font-medium text-muted hover:text-fg">
            List your service
          </Link>
          <Link href="/market" className="btn-primary px-4 py-2 text-[13px]">
            📲 Join free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-fg md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-5 bg-current transition ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span className={`block h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
            <span
              className={`block h-0.5 w-5 bg-current transition ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-ink-950/95 backdrop-blur-xl md:hidden">
          <div className="container-content flex flex-col gap-1 py-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted hover:bg-white/[0.04] hover:text-fg"
              >
                <span>{l.emoji}</span>
                {l.label}
              </Link>
            ))}
            <Link href="/market" className="btn-primary mt-2" onClick={() => setOpen(false)}>
              📲 Join free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
