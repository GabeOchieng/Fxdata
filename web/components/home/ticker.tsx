import { TICKER } from "@/lib/constants";

export function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="relative overflow-hidden border-y border-line bg-ink-900/50 py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-950 to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-3 font-mono text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan/70" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
