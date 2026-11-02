"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RENTALS, RENTAL_TYPES } from "@/lib/data";
import { Chip, priceKES, WhatsAppButton } from "@/components/ui";

export function RentalBrowser() {
  const [type, setType] = useState("all");
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sort, setSort] = useState<"featured" | "price_asc" | "price_desc">("featured");

  const rentals = useMemo(() => {
    let list = RENTALS.filter(
      (r) =>
        (type === "all" || r.type === type) &&
        (!furnishedOnly || r.furnished) &&
        r.price <= maxPrice
    );
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [type, furnishedOnly, maxPrice, sort]);

  return (
    <div className="container-content py-12">
      {/* filter bar */}
      <div className="rounded-2xl border border-line bg-white/[0.02] p-5">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {RENTAL_TYPES.map((t) => (
            <Chip key={t.value} active={type === t.value} onClick={() => setType(t.value)}>
              {t.label}
            </Chip>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex-1">
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              <span>Max rent</span>
              <span className="font-mono text-fg">{priceKES(maxPrice)}/mo</span>
            </div>
            <input
              type="range"
              min={8000}
              max={100000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-brand-cyan"
            />
          </label>

          <button
            onClick={() => setFurnishedOnly((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              furnishedOnly
                ? "border-brand-green/50 bg-brand-green/10 text-brand-green"
                : "border-line text-muted hover:text-fg"
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded ${
                furnishedOnly ? "bg-brand-green text-ink-950" : "border border-line2"
              }`}
            >
              {furnishedOnly ? "✓" : ""}
            </span>
            Furnished only
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-xl border border-line bg-ink-900 px-4 py-2.5 text-sm text-fg outline-none focus:border-brand-cyan/60"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted">
        <b className="font-mono text-fg">{rentals.length}</b> homes available
      </div>

      {/* cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rentals.map((r, i) => (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.02] transition hover:border-line2 hover:bg-white/[0.04]"
          >
            {/* image placeholder with gradient */}
            <div
              className="relative h-40 w-full"
              style={{
                background: `linear-gradient(135deg, ${r.accent}22, transparent 60%), radial-gradient(circle at 70% 20%, ${r.accent}33, transparent 55%)`,
              }}
            >
              <div className="absolute inset-0 bg-grid-faint bg-[size:26px_26px] opacity-40" />
              <span className="absolute left-3 top-3 rounded-full border border-line2 bg-ink-950/70 px-2.5 py-1 text-[11px] font-semibold text-fg backdrop-blur">
                {r.typeLabel}
              </span>
              {r.furnished && (
                <span className="absolute right-3 top-3 rounded-full border border-brand-green/40 bg-brand-green/15 px-2.5 py-1 text-[10px] font-bold uppercase text-brand-green">
                  Furnished
                </span>
              )}
              <span className="absolute bottom-3 right-3 text-4xl opacity-70">🏠</span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight text-fg">{r.title}</h3>
              </div>
              <div className="mt-1 text-xs text-muted">📍 {r.area}</div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.beds > 0 && (
                  <span className="rounded-md border border-line px-2 py-0.5 text-[11px] text-muted">
                    🛏 {r.beds} bed
                  </span>
                )}
                <span className="rounded-md border border-line px-2 py-0.5 text-[11px] text-muted">
                  🚿 {r.baths} bath
                </span>
                <span className="rounded-md border border-line px-2 py-0.5 text-[11px] text-muted">
                  🚐 {r.matatuStage} · {r.matatuMins}m
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.amenities.slice(0, 3).map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-muted"
                  >
                    {a}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex items-end justify-between border-t border-line pt-4">
                <div>
                  <div className="font-display text-xl font-bold text-fg">
                    {priceKES(r.price)}
                    <span className="text-xs font-normal text-muted">/mo</span>
                  </div>
                  <div className="text-[11px] text-faint">Deposit {priceKES(r.deposit)}</div>
                </div>
                <WhatsAppButton label="Enquire" />
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {rentals.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted">
          No homes match those filters. Try raising the max rent.
        </p>
      )}
    </div>
  );
}
