"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PROS } from "@/lib/data";
import { Chip, Stars, LevelBar, WhatsAppButton, priceKES } from "@/components/ui";

const FILTERS = [
  { slug: "all", label: "All pros", color: "#00e5ff" },
  { slug: "beauty", label: "Beauty", color: "#ff3d9a" },
  { slug: "construction", label: "Construction", color: "#ff8c00" },
  { slug: "food", label: "Food", color: "#ff6b2b" },
  { slug: "tech", label: "Tech", color: "#00d4ff" },
  { slug: "home", label: "Home", color: "#7c5cff" },
  { slug: "events", label: "Events", color: "#ffd000" },
  { slug: "education", label: "Education", color: "#00ffb3" },
];

export function ProDirectory() {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const pros = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PROS.filter(
      (p) =>
        (filter === "all" || p.categorySlug === filter) &&
        (!needle ||
          p.name.toLowerCase().includes(needle) ||
          p.title.toLowerCase().includes(needle) ||
          p.area.toLowerCase().includes(needle))
    );
  }, [filter, q]);

  return (
    <div className="container-content py-12">
      <div className="flex flex-col gap-4">
        <div className="relative w-full sm:max-w-sm">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            🔍
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, service or area…"
            className="w-full rounded-xl border border-line bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-fg outline-none transition placeholder:text-faint focus:border-brand-cyan/60"
          />
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <Chip
              key={f.slug}
              active={filter === f.slug}
              color={f.color}
              onClick={() => setFilter(f.slug)}
            >
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pros.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.02] p-5 transition hover:border-line2 hover:bg-white/[0.04]"
          >
            {p.featured && (
              <span className="absolute right-4 top-4 rounded-full border border-brand-amber/40 bg-brand-amber/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-amber">
                ★ Featured
              </span>
            )}
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold text-ink-950"
                style={{ background: p.accent }}
              >
                {p.initials}
              </span>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-fg">{p.name}</h3>
                <p className="truncate text-xs text-muted">{p.title}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Stars rating={p.rating} />
              <span className="text-xs text-muted">{p.reviews} reviews</span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted">
              <span className="rounded-full border border-line px-2.5 py-1">📍 {p.area}</span>
              <span
                className="rounded-full border px-2.5 py-1"
                style={{ borderColor: `${p.accent}55`, color: p.accent }}
              >
                {p.category}
              </span>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
                <span>
                  {p.level} · {p.jobs} jobs
                </span>
                <span className="font-mono" style={{ color: p.accent }}>
                  {p.xp.toLocaleString()} XP
                </span>
              </div>
              <LevelBar xp={p.xp} accent={p.accent} />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <div>
                <div className="text-[11px] text-faint">From</div>
                <div className="font-display text-lg font-bold text-fg">
                  {priceKES(p.priceFrom)}
                </div>
              </div>
              <WhatsAppButton label="Book" />
            </div>
          </motion.article>
        ))}
      </div>

      {pros.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted">No pros match your filters yet.</p>
      )}
    </div>
  );
}
