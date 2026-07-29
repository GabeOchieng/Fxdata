import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight ${className}`}
      aria-label="KaziHub home"
    >
      <span className="relative inline-flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-brand-cyan" />
        <span className="absolute inline-flex h-full w-full rounded-full bg-brand-cyan/40 blur-[3px]" />
      </span>
      <span className="text-fg">
        Kazi<span className="text-brand-cyan">Hub</span>
      </span>
    </Link>
  );
}
