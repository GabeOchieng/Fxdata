"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api, type BubbleDatum } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";

type Cell = {
  slug: string;
  name: string;
  icon: string;
  color: string;
  listings: number;
  workers: number;
  xp: number;
};

// Deterministic pseudo-random so the fallback looks alive but stable per slug.
function seeded(slug: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 100000;
  return h;
}

function fallbackCells(): Cell[] {
  return CATEGORIES.map((c) => {
    const listings = 40 + (seeded(c.slug, 7) % 260);
    return {
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      color: c.color,
      listings,
      workers: listings + (seeded(c.slug, 13) % 400),
      xp: 2500 + (seeded(c.slug, 29) % 7000),
    };
  });
}

function mergeApi(rows: BubbleDatum[]): Cell[] {
  const fb = fallbackCells();
  const byslug = new Map(fb.map((c) => [c.slug, c]));
  for (const r of rows) {
    const base = byslug.get(r.slug) ?? {
      slug: r.slug,
      name: r.name,
      icon: r.icon ?? "•",
      color: r.color ?? "#00e5ff",
      listings: 0,
      workers: 0,
      xp: 0,
    };
    // Prefer live numbers when present, else keep the demo baseline.
    byslug.set(r.slug, {
      ...base,
      name: r.name || base.name,
      icon: r.icon || base.icon,
      color: r.color || base.color,
      listings: r.listings || base.listings,
      workers: r.workers || base.workers,
      xp: r.xp || base.xp,
    });
  }
  return [...byslug.values()];
}

export function MarketExplorer() {
  const [cells, setCells] = useState<Cell[]>(fallbackCells);
  const [live, setLive] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .bubbleData()
      .then((rows) => {
        if (!cancelled && rows?.length) {
          setCells(mergeApi(rows));
          setLive(true);
        }
      })
      .catch(() => {
        /* offline — keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle
      ? cells.filter((c) => c.name.toLowerCase().includes(needle))
      : cells;
    return [...list].sort((a, b) => b.xp - a.xp);
  }, [cells, q]);

  const maxXp = Math.max(...cells.map((c) => c.xp), 1);
  const totals = cells.reduce(
    (acc, c) => ({ listings: acc.listings + c.listings, workers: acc.workers + c.workers }),
    { listings: 0, workers: 0 }
  );

  return (
    <div className="container-content py-12">
      {/* controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            🔍
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a trade — electrician, chef, mama fua…"
            className="w-full rounded-xl border border-line bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-fg outline-none transition placeholder:text-faint focus:border-brand-cyan/60"
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span>
            <b className="font-mono text-fg">{cells.length}</b> categories
          </span>
          <span>
            <b className="font-mono text-fg">{totals.workers.toLocaleString()}</b> pros
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
              live
                ? "border-brand-green/40 text-brand-green"
                : "border-line text-faint"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${live ? "bg-brand-green" : "bg-faint"}`}
            />
            {live ? "Live API" : "Sample data"}
          </span>
        </div>
      </div>

      {/* bubble grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((c, i) => {
          const intensity = 0.35 + (c.xp / maxXp) * 0.65;
          return (
            <motion.a
              key={c.slug}
              href="#"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.4) }}
              className="group relative overflow-hidden rounded-2xl border border-line bg-white/[0.02] p-5 transition hover:border-line2 hover:bg-white/[0.05]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-[45px] transition-opacity duration-300"
                style={{ background: c.color, opacity: intensity * 0.25 }}
              />
              <div className="flex items-center justify-between">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                  style={{ background: `${c.color}18`, border: `1px solid ${c.color}40` }}
                >
                  {c.icon}
                </span>
                <span className="font-mono text-[11px] text-faint">
                  {c.listings} listings
                </span>
              </div>
              <h3 className="mt-4 font-semibold leading-tight text-fg">{c.name}</h3>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                <span>{c.workers.toLocaleString()} pros</span>
                <span className="font-mono" style={{ color: c.color }}>
                  {Math.round(c.xp).toLocaleString()} XP
                </span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(c.xp / maxXp) * 100}%`, background: c.color }}
                />
              </div>
            </motion.a>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted">
          No categories match “{q}”. Try another trade.
        </p>
      )}
    </div>
  );
}
