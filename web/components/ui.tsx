import type { ReactNode } from "react";
import { Reveal } from "./reveal";

export function PageHeader({
  kicker,
  title,
  subtitle,
  accent = "#00e5ff",
}: {
  kicker: string;
  title: ReactNode;
  subtitle?: string;
  accent?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_55%_60%_at_50%_0%,#000_30%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[720px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: `${accent}1f` }}
      />
      <div className="container-content relative py-16 sm:py-20">
        <Reveal>
          <span className="kicker">{kicker}</span>
        </Reveal>
        <Reveal delay={1}>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={2}>
            <p className="mt-4 max-w-2xl text-muted">{subtitle}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1 text-brand-amber">
      <span aria-hidden className="tracking-[-1px]">
        {"★".repeat(full)}
        <span className="text-faint">{"★".repeat(5 - full)}</span>
      </span>
      <span className="text-xs font-semibold text-fg">{rating.toFixed(1)}</span>
    </span>
  );
}

export function LevelBar({
  xp,
  max = 10000,
  accent = "#00e5ff",
}: {
  xp: number;
  max?: number;
  accent?: string;
}) {
  const pct = Math.max(4, Math.min(100, (xp / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${accent}, #00ffb3)`,
        }}
      />
    </div>
  );
}

export function WhatsAppButton({
  label = "Order on WhatsApp",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#25d366]/40 bg-[#25d366]/10 px-4 py-2.5 text-sm font-semibold text-[#25d366] transition hover:bg-[#25d366]/20 ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.42 1.32-1.95 1.36-.5.04-1.13.2-3.8-.79-3.2-1.26-5.24-4.5-5.4-4.71-.16-.21-1.3-1.72-1.3-3.28s.82-2.33 1.11-2.65c.29-.32.63-.4.84-.4l.6.01c.19 0 .45-.07.7.54.24.6.83 2.06.9 2.2.07.15.12.32.02.53-.1.21-.15.32-.3.5-.15.17-.32.39-.46.52-.15.15-.31.31-.13.6.18.3.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.48 1.53.3.15.48.13.66-.08.18-.21.76-.89.96-1.19.2-.3.4-.25.67-.15.27.1 1.71.81 2.01.96.3.15.5.22.57.34.07.13.07.72-.17 1.4Z" />
      </svg>
      {label}
    </span>
  );
}

/** Client-side reusable filter chip. */
export function Chip({
  active,
  children,
  onClick,
  color,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-transparent text-ink-950"
          : "border-line bg-white/[0.02] text-muted hover:border-line2 hover:text-fg"
      }`}
      style={active ? { background: color ?? "#00e5ff" } : undefined}
    >
      {children}
    </button>
  );
}

export function priceKES(n: number): string {
  return "KES " + n.toLocaleString("en-KE");
}
