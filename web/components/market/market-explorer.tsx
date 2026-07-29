"use client";

import { useState } from "react";
import { CATS } from "@/lib/market-data";
import { BubbleField } from "./bubble-field";

const CAT_KEYS = Object.keys(CATS);

export function MarketExplorer() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  return (
    <div className="container-content py-8">
      {/* search */}
      <div className="relative w-full sm:max-w-sm">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a hustle — electrician, chef, mama fua…"
          className="w-full rounded-xl border border-line bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-fg outline-none transition placeholder:text-faint focus:border-brand-cyan/60"
        />
      </div>

      {/* category pills */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <Pill active={activeCat === "all"} onClick={() => setActiveCat("all")}>All</Pill>
        {CAT_KEYS.map((k) => (
          <Pill key={k} active={activeCat === k} color={CATS[k].color} onClick={() => setActiveCat(k)}>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: CATS[k].color, display: activeCat === k ? "none" : "inline-block" }}
            />
            {CATS[k].icon} {CATS[k].label}
          </Pill>
        ))}
      </div>

      {/* the keystone bubble field */}
      <div className="mt-5">
        <BubbleField query={query} activeCat={activeCat} />
        <p className="mt-3 text-center text-xs text-faint">
          Bubble size = community XP · drag them around · hover for detail · click to see pros
        </p>
      </div>
    </div>
  );
}

function Pill({
  active,
  color,
  onClick,
  children,
}: {
  active?: boolean;
  color?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
        active ? "border-transparent text-ink-950" : "border-line bg-white/[0.02] text-muted hover:border-line2 hover:text-fg"
      }`}
      style={active ? { background: color ?? "#00e5ff" } : undefined}
    >
      {children}
    </button>
  );
}
