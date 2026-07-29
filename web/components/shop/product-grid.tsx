"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PRODUCTS, type Product } from "@/lib/data";
import { Chip, Stars, priceKES } from "@/components/ui";

function ProductCard({ p, index }: { p: Product; index: number }) {
  const [size, setSize] = useState(p.sizes[Math.min(1, p.sizes.length - 1)]);
  const [color, setColor] = useState(p.colors[0]);
  const off = p.wasPrice ? Math.round(((p.wasPrice - p.price) / p.wasPrice) * 100) : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.02] transition hover:border-line2 hover:bg-white/[0.04]"
    >
      <div
        className="relative flex h-52 items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${p.accent}26, transparent 60%)`,
        }}
      >
        <div className="absolute inset-0 bg-grid-faint bg-[size:26px_26px] opacity-30" />
        <span className="text-7xl drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110">
          {p.kind === "footwear" ? "👟" : "👕"}
        </span>
        {p.badge && (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-950"
            style={{ background: p.accent }}
          >
            {p.badge}
          </span>
        )}
        {off > 0 && (
          <span className="absolute right-3 top-3 rounded-full border border-brand-magenta/40 bg-brand-magenta/15 px-2.5 py-1 text-[10px] font-bold text-brand-magenta">
            −{off}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>{p.category}</span>
          <Stars rating={p.rating} />
        </div>
        <h3 className="mt-1.5 font-semibold leading-tight text-fg">{p.name}</h3>

        {/* colours */}
        <div className="mt-3 flex items-center gap-2">
          {p.colors.map((c) => (
            <button
              key={c.name}
              aria-label={c.name}
              onClick={() => setColor(c)}
              className={`h-5 w-5 rounded-full border transition ${
                color.name === c.name
                  ? "ring-2 ring-offset-2 ring-offset-ink-950"
                  : "border-line2"
              }`}
              style={{
                background: c.hex,
                boxShadow: color.name === c.name ? `0 0 0 2px ${p.accent}` : undefined,
              }}
            />
          ))}
          <span className="ml-1 text-[11px] text-muted">{color.name}</span>
        </div>

        {/* sizes */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`min-w-[2rem] rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                size === s
                  ? "border-transparent bg-fg text-ink-950"
                  : "border-line text-muted hover:text-fg"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-line pt-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-fg">{priceKES(p.price)}</span>
              {p.wasPrice && (
                <span className="text-xs text-faint line-through">{priceKES(p.wasPrice)}</span>
              )}
            </div>
            <div className="text-[11px] text-faint">{p.sold} sold</div>
          </div>
          <button className="btn-primary px-4 py-2 text-[13px]">Add · M-Pesa</button>
        </div>
      </div>
    </motion.article>
  );
}

export function ProductGrid({ kind }: { kind: "footwear" | "merch" }) {
  const cats = useMemo(() => {
    const set = Array.from(
      new Set(PRODUCTS.filter((p) => p.kind === kind).map((p) => p.category))
    );
    return ["All", ...set];
  }, [kind]);
  const [cat, setCat] = useState("All");

  const items = useMemo(
    () => PRODUCTS.filter((p) => p.kind === kind && (cat === "All" || p.category === cat)),
    [kind, cat]
  );

  return (
    <div className="container-content py-12">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {cats.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.id} p={p} index={i} />
        ))}
      </div>
    </div>
  );
}
