"use client";

import { useEffect, useRef, useState } from "react";

export type BubbleCell = {
  slug: string;
  name: string;
  icon: string;
  color: string;
  listings: number;
  workers: number;
  xp: number;
};

type Bubble = {
  cell: BubbleCell;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  targetR: number;
  tx: number;
  ty: number;
  rising: boolean;
  riseT: number;
  riseFrame: number;
  riseDelay: number;
  riseSpeed: number;
  riseStartY: number;
  wobbleAmp: number;
  wobbleFreq: number;
  wobblePhase: number;
  scaleT: number;
  pulse: number;
  dim: number; // 0 = full, 1 = dimmed (filtered out)
};

type Tip = { x: number; y: number; cell: BubbleCell } | null;

function hexRgba(hex: string, a: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);

export function BubbleField({
  cells,
  query,
  onSelect,
}: {
  cells: BubbleCell[];
  query: string;
  onSelect?: (slug: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const queryRef = useRef(query);
  const hoverRef = useRef<Bubble | null>(null);
  const [tip, setTip] = useState<Tip>(null);

  queryRef.current = query;

  // Rebuild the simulation whenever the data set or canvas size changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || cells.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let frame = 0;

    function layout() {
      W = wrap!.clientWidth;
      H = wrap!.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Radius ∝ sqrt(xp), then scaled so bubbles fill ~52% of the canvas.
      const raw = cells.map((c) => Math.sqrt(Math.max(1, c.xp)));
      const sumSq = raw.reduce((a, r) => a + r * r, 0);
      const fill = 0.52;
      const s = Math.sqrt((fill * W * H) / (Math.PI * sumSq));
      const minR = Math.max(26, Math.min(W, H) * 0.05);
      const maxR = Math.min(W, H) * 0.19;
      const radii = raw.map((r) => Math.max(minR, Math.min(maxR, r * s)));

      // Seed targets, then relax overlaps with separation passes.
      const targets = cells.map((c, i) => ({
        c,
        r: radii[i],
        x: radii[i] + 8 + Math.random() * (W - 2 * radii[i] - 16),
        y: radii[i] + 8 + Math.random() * (H - 2 * radii[i] - 16),
      }));
      for (let pass = 0; pass < 160; pass++) {
        for (let i = 0; i < targets.length; i++) {
          for (let j = i + 1; j < targets.length; j++) {
            const a = targets[i];
            const b = targets[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d2 = dx * dx + dy * dy;
            const minD = a.r + b.r + 4;
            if (d2 < minD * minD && d2 > 0.01) {
              const dist = Math.sqrt(d2);
              const nx = dx / dist;
              const ny = dy / dist;
              const ov = (minD - dist) * 0.5;
              a.x -= nx * ov;
              a.y -= ny * ov;
              b.x += nx * ov;
              b.y += ny * ov;
            }
          }
          targets[i].x = Math.max(targets[i].r + 4, Math.min(W - targets[i].r - 4, targets[i].x));
          targets[i].y = Math.max(targets[i].r + 4, Math.min(H - targets[i].r - 4, targets[i].y));
        }
      }
      targets.sort((a, b) => a.x - b.x);

      bubblesRef.current = targets.map((t, i) => {
        const startY = H + t.r + Math.random() * 60;
        return {
          cell: t.c,
          x: reduced ? t.x : t.x + (Math.random() - 0.5) * 30,
          y: reduced ? t.y : startY,
          vx: 0,
          vy: 0,
          r: reduced ? t.r : 0,
          targetR: t.r,
          tx: t.x,
          ty: t.y,
          rising: !reduced,
          riseT: reduced ? 1 : 0,
          riseFrame: 0,
          riseDelay: reduced ? 0 : Math.floor((i / targets.length) * 150) + Math.floor(Math.random() * 24),
          riseSpeed: 0.006 + Math.random() * 0.003,
          riseStartY: startY,
          wobbleAmp: (Math.random() * 0.6 + 0.3) * t.r * 0.8,
          wobbleFreq: 0.8 + Math.random() * 0.6,
          wobblePhase: Math.random() * Math.PI * 2,
          scaleT: reduced ? 1 : 0,
          pulse: Math.random() * Math.PI * 2,
          dim: 0,
        };
      });
    }

    function step() {
      const bubbles = bubblesRef.current;
      const cx = W / 2;
      const cy = H / 2;
      const q = queryRef.current.trim().toLowerCase();

      for (const b of bubbles) {
        // filter dimming (smoothed)
        const match = !q || b.cell.name.toLowerCase().includes(q);
        b.dim += ((match ? 0 : 1) - b.dim) * 0.15;

        if (b.rising) {
          b.riseFrame++;
          if (b.riseFrame < b.riseDelay) continue;
          b.riseT = Math.min(1, b.riseT + b.riseSpeed);
          b.scaleT = Math.min(1, b.scaleT + b.riseSpeed * 1.2);
          const et = easeOut(b.riseT);
          b.y = b.riseStartY - (b.riseStartY - b.ty) * et;
          const fade = Math.pow(1 - b.riseT, 1.4);
          b.x = b.tx + Math.sin(b.riseT * 14 * b.wobbleFreq + b.wobblePhase) * b.wobbleAmp * fade;
          b.r = b.targetR * easeOut(b.scaleT);
          if (b.riseT >= 1) {
            b.rising = false;
            b.x = b.tx;
            b.y = b.ty;
            b.r = b.targetR;
          }
        } else {
          b.r = b.targetR;
          // near-still buoyant drift toward centre with damping
          b.vx += (cx - b.x) * 0.000006;
          b.vy += (cy - b.y) * 0.000006;
          b.vx *= 0.962;
          b.vy *= 0.962;
          const spd = Math.hypot(b.vx, b.vy);
          if (spd > 0.9) {
            const k = 0.9 / spd;
            b.vx *= k;
            b.vy *= k;
          }
          b.x += b.vx;
          b.y += b.vy;
          // bounds
          if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx); }
          if (b.x + b.r > W) { b.x = W - b.r; b.vx = -Math.abs(b.vx); }
          if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy); }
          if (b.y + b.r > H) { b.y = H - b.r; b.vy = -Math.abs(b.vy); }
        }
      }

      // gentle collision separation (settled bubbles)
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const a = bubbles[i];
          const b = bubbles[j];
          if (a.rising && b.rising) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          const minD = a.r + b.r + 4;
          if (d2 < minD * minD && d2 > 0.01) {
            const dist = Math.sqrt(d2);
            const nx = dx / dist;
            const ny = dy / dist;
            const ov = (minD - dist) * 0.04;
            if (!a.rising) { a.x -= nx * ov; a.y -= ny * ov; }
            if (!b.rising) { b.x += nx * ov; b.y += ny * ov; }
          }
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      frame++;
      const hov = hoverRef.current;
      // large → small so small bubbles sit on top and stay clickable
      const order = bubblesRef.current.slice().sort((a, b) => b.r - a.r);
      for (const b of order) {
        const r = b.r;
        if (r < 1) continue;
        const alpha = 1 - b.dim * 0.82;
        const isH = b === hov;
        const col = b.cell.color;
        const pulse = 1 + Math.sin(frame * 0.05 + b.pulse) * 0.012;
        const rr = r * pulse;

        // glow
        if (isH) {
          ctx!.beginPath();
          ctx!.arc(b.x, b.y, rr + 6, 0, Math.PI * 2);
          ctx!.fillStyle = hexRgba(col, 0.14 * alpha);
          ctx!.fill();
        }

        // sphere gradient
        const g = ctx!.createRadialGradient(
          b.x - rr * 0.32,
          b.y - rr * 0.36,
          rr * 0.1,
          b.x,
          b.y,
          rr
        );
        g.addColorStop(0, hexRgba(col, (isH ? 0.42 : 0.30) * alpha));
        g.addColorStop(0.6, hexRgba(col, (isH ? 0.20 : 0.13) * alpha));
        g.addColorStop(1, hexRgba(col, 0.03 * alpha));
        ctx!.beginPath();
        ctx!.arc(b.x, b.y, rr, 0, Math.PI * 2);
        ctx!.fillStyle = g;
        ctx!.fill();

        // rim
        ctx!.lineWidth = isH ? 2 : 1;
        ctx!.strokeStyle = hexRgba(col, (isH ? 0.9 : 0.5) * alpha);
        ctx!.stroke();

        // top highlight
        ctx!.beginPath();
        ctx!.arc(b.x - rr * 0.3, b.y - rr * 0.34, rr * 0.5, 0, Math.PI * 2);
        ctx!.fillStyle = hexRgba("#ffffff", 0.05 * alpha);
        ctx!.fill();

        // content
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        const eSize = Math.max(12, rr * 0.5);
        if (rr > 30) {
          ctx!.globalAlpha = alpha;
          ctx!.font = `${eSize}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
          ctx!.fillText(b.cell.icon, b.x, b.y - rr * 0.16);
          ctx!.globalAlpha = 1;
          // label
          const fs = Math.max(9, Math.min(13, rr * 0.2));
          ctx!.font = `600 ${fs}px Inter, sans-serif`;
          ctx!.fillStyle = hexRgba("#f0eee8", 0.92 * alpha);
          const label = b.cell.name.length > 16 ? b.cell.name.slice(0, 15) + "…" : b.cell.name;
          ctx!.fillText(label, b.x, b.y + rr * 0.34);
          if (rr > 52) {
            ctx!.font = `600 ${Math.max(8, fs * 0.8)}px "JetBrains Mono", monospace`;
            ctx!.fillStyle = hexRgba(col, 0.95 * alpha);
            ctx!.fillText(`${Math.round(b.cell.xp).toLocaleString()} XP`, b.x, b.y + rr * 0.56);
          }
        } else {
          // tiny: emoji only
          ctx!.globalAlpha = alpha;
          ctx!.font = `${eSize}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
          ctx!.fillText(b.cell.icon, b.x, b.y);
          ctx!.globalAlpha = 1;
        }
      }
    }

    function frameLoop() {
      step();
      draw();
      raf = requestAnimationFrame(frameLoop);
    }

    layout();
    frameLoop();

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [cells]);

  // Pointer interactions (mouse, touch and pen via Pointer Events)
  function pick(clientX: number, clientY: number): Bubble | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rc = canvas.getBoundingClientRect();
    const mx = clientX - rc.left;
    const my = clientY - rc.top;
    // small-first so tiny bubbles on top win the hit test
    const order = bubblesRef.current.slice().sort((a, b) => a.r - b.r);
    for (const b of order) {
      if (b.dim > 0.6) continue;
      const dx = mx - b.x;
      const dy = my - b.y;
      if (dx * dx + dy * dy < b.r * b.r) return b;
    }
    return null;
  }

  function showTip(b: Bubble | null, clientX: number, clientY: number) {
    hoverRef.current = b;
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = b ? "pointer" : "default";
    if (b) {
      const rc = wrapRef.current!.getBoundingClientRect();
      setTip({ x: clientX - rc.left, y: clientY - rc.top, cell: b.cell });
    } else if (tip) {
      setTip(null);
    }
  }

  function onMove(e: React.PointerEvent) {
    showTip(pick(e.clientX, e.clientY), e.clientX, e.clientY);
  }

  // Tap-to-preview on touch: first tap shows the tooltip, second tap (on the
  // same bubble) drills in. On mouse, a click drills in immediately.
  const lastTapRef = useRef<string | null>(null);
  function onPointerDown(e: React.PointerEvent) {
    const b = pick(e.clientX, e.clientY);
    if (e.pointerType === "touch") {
      if (b && lastTapRef.current === b.cell.slug) {
        lastTapRef.current = null;
        setTip(null);
        onSelect?.(b.cell.slug);
      } else {
        lastTapRef.current = b?.cell.slug ?? null;
        showTip(b, e.clientX, e.clientY);
      }
    }
  }

  function onLeave() {
    hoverRef.current = null;
    setTip(null);
  }

  function onClick(e: React.MouseEvent) {
    // Mouse only — touch is handled in onPointerDown.
    if ((e as unknown as PointerEvent).pointerType === "touch") return;
    const b = pick(e.clientX, e.clientY);
    if (b && onSelect) onSelect(b.cell.slug);
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-[68vh] min-h-[460px] w-full overflow-hidden rounded-3xl border border-line bg-[rgba(2,5,12,0.5)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:40px_40px] opacity-40"
      />
      <canvas
        ref={canvasRef}
        onPointerMove={onMove}
        onPointerDown={onPointerDown}
        onPointerLeave={onLeave}
        onClick={onClick}
        className="relative block touch-manipulation"
      />
      {tip && (
        <div
          className="pointer-events-none absolute z-20 w-56 -translate-x-1/2 rounded-xl border border-line2 bg-ink-900/95 p-3.5 shadow-2xl backdrop-blur"
          style={{
            left: Math.max(120, Math.min((wrapRef.current?.clientWidth ?? 400) - 120, tip.x)),
            top: Math.max(8, tip.y - 128),
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{tip.cell.icon}</span>
            <span className="font-semibold text-fg">{tip.cell.name}</span>
          </div>
          <div className="mt-2.5 space-y-1.5 text-xs">
            <Row label="Listings" value={tip.cell.listings.toLocaleString()} />
            <Row label="Professionals" value={tip.cell.workers.toLocaleString()} />
            <Row
              label="Community XP"
              value={Math.round(tip.cell.xp).toLocaleString()}
              color={tip.cell.color}
            />
          </div>
          <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(100, (tip.cell.xp / 10000) * 100)}%`, background: tip.cell.color }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-mono font-semibold" style={{ color: color ?? "#f0eee8" }}>
        {value}
      </span>
    </div>
  );
}
