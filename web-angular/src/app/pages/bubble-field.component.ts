import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import {
  AREAS,
  CATS,
  PNAMES,
  buildServiceData,
  getLevel,
  type ServiceDatum,
} from "../market-data";

interface Bubble {
  d: ServiceDatum;
  x: number; y: number; vx: number; vy: number; r: number;
  filtered: boolean; pulse: number;
  rising: boolean; riseTargetX: number; riseTargetY: number; riseStartY: number;
  riseT: number; riseDelay: number; riseFrame: number; riseSpeed: number;
  wobbleAmp: number; wobbleFreq: number; wobblePhase: number; scaleT: number;
}
interface Pro { name: string; init: string; area: string; rating: number; jobs: number; xp: number; levelName: string; levelColor: string; }

const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const rndF = (a: number, b: number) => parseFloat((a + Math.random() * (b - a)).toFixed(1));
const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);
function parseColor(c: string): [number, number, number] {
  let h = c.trim();
  if (h[0] === "#") { h = h.slice(1); if (h.length === 3) h = h.split("").map((x) => x + x).join(""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  const m = h.match(/[\d.]+/g); return m ? [+m[0], +m[1], +m[2]] : [128, 128, 128];
}
const darken = (c: string, a: number) => { const p = parseColor(c); return `rgb(${Math.round(p[0] * (1 - a))},${Math.round(p[1] * (1 - a))},${Math.round(p[2] * (1 - a))})`; };
const lighten = (c: string, a: number) => { const p = parseColor(c); return `rgb(${Math.round(p[0] + (255 - p[0]) * a)},${Math.round(p[1] + (255 - p[1]) * a)},${Math.round(p[2] + (255 - p[2]) * a)})`; };
const hexRgba = (hex: string, a: number) => { const p = parseColor(hex); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; };
const FILL_RATIO = 0.52, MIN_MULT = 0.42, MAX_MULT = 2.05;

@Component({
  selector: "app-bubble-field",
  standalone: true,
  template: `
    <div #wrap class="relative w-full overflow-hidden rounded-2xl border border-line"
         style="height:clamp(460px,68vh,820px);background:rgba(1,2,6,0.92);touch-action:none">
      <canvas #cv class="absolute inset-0 block h-full w-full"></canvas>
    </div>

    @if (tip) {
      <div class="pointer-events-none fixed z-[60] w-56 rounded-2xl border border-line2 bg-ink-900/95 p-3.5 shadow-2xl backdrop-blur"
           [style.left.px]="tipLeft" [style.top.px]="tipTop">
        <div class="text-sm font-bold">{{ tip.emoji }} {{ tip.label }}</div>
        <div class="mb-2.5 mt-0.5 text-[10px] text-muted">{{ catLabel(tip.cat) }}</div>
        <div class="mb-1 flex justify-between text-[11px]"><span class="text-muted">Professionals</span><span class="font-mono font-semibold">{{ tip.workers }}</span></div>
        <div class="mb-1 flex justify-between text-[11px]"><span class="text-muted">Rating</span><span class="font-mono font-semibold">⭐ {{ tip.rating }}</span></div>
        <div class="mb-1 flex justify-between text-[11px]"><span class="text-muted">Jobs</span><span class="font-mono font-semibold">{{ tip.jobs.toLocaleString() }}</span></div>
        <div class="mb-1 flex justify-between text-[11px]"><span class="text-muted">Growth</span>
          <span class="font-mono font-semibold" [style.color]="tip.growth >= 0 ? '#00ffb3' : '#ff3d5a'">{{ tip.growth >= 0 ? '+' : '' }}{{ tip.growth }}%</span></div>
        <div class="mb-1 mt-2.5 text-[9px] uppercase tracking-wide text-muted">Community Level</div>
        <div class="h-1 overflow-hidden rounded-full bg-white/10">
          <div class="h-full rounded-full" [style.width.%]="tip.communityXP / 100" [style.background]="'linear-gradient(90deg,' + tip.level.color + ',' + tip.color + ')'"></div>
        </div>
        <span class="mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide"
              [style.color]="tip.level.color" [style.border-color]="tip.level.color + '44'">{{ tip.level.name }} · {{ tip.communityXP.toLocaleString() }} XP</span>
      </div>
    }

    @if (modal) {
      <div class="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" (click)="onBackdrop($event)">
        <div class="max-h-[88vh] w-[min(560px,96vw)] overflow-y-auto rounded-3xl border border-line2 bg-ink-800 p-6">
          <div class="mb-4 flex items-start justify-between">
            <div class="text-xl font-bold">{{ modal.emoji }} {{ modal.label }}</div>
            <button (click)="modal = null" class="h-8 w-8 rounded-full border border-line bg-white/5 text-muted hover:text-fg">✕</button>
          </div>
          <div class="mb-4 flex overflow-hidden rounded-xl border border-line">
            <div class="flex-1 border-r border-line p-3 text-center"><div class="font-mono text-lg font-bold" [style.color]="modal.color">{{ modal.workers }}</div><div class="mt-0.5 text-[9px] uppercase tracking-wide text-muted">Pros</div></div>
            <div class="flex-1 border-r border-line p-3 text-center"><div class="font-mono text-lg font-bold text-[#ffbe00]">⭐{{ modal.rating }}</div><div class="mt-0.5 text-[9px] uppercase tracking-wide text-muted">Rating</div></div>
            <div class="flex-1 border-r border-line p-3 text-center"><div class="font-mono text-lg font-bold text-brand-cyan">{{ modal.jobs.toLocaleString() }}</div><div class="mt-0.5 text-[9px] uppercase tracking-wide text-muted">Jobs</div></div>
            <div class="flex-1 p-3 text-center"><div class="font-mono text-lg font-bold" [style.color]="modal.level.color">{{ modal.level.name }}</div><div class="mt-0.5 text-[9px] uppercase tracking-wide text-muted">Level</div></div>
          </div>
          <div class="mb-2 text-[9px] font-bold uppercase tracking-wide text-muted">Available Professionals</div>
          <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            @for (w of pros; track w) {
              <div class="rounded-xl border border-line bg-white/[0.03] p-3">
                <div class="mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-ink-950" [style.background]="modal.color">{{ w.init }}</div>
                <div class="text-xs font-semibold">{{ w.name }}</div>
                <div class="mb-1 text-[10px] text-muted">📍 {{ w.area }}</div>
                <div class="mb-1.5 text-[11px] text-brand-amber">{{ stars(w.rating) }} {{ w.rating }} ({{ w.jobs }})</div>
                <span class="mb-1.5 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase" [style.color]="w.levelColor" [style.border-color]="w.levelColor + '44'">{{ w.levelName }}</span>
                <div class="mt-1.5 text-[11px] font-semibold text-[#25d366]">💬 Chat on WhatsApp</div>
              </div>
            }
          </div>
          <div class="mt-4 rounded-2xl border border-brand-green/20 bg-gradient-to-br from-brand-green/[0.08] to-brand-amber/[0.04] p-4 text-center">
            <h4 class="text-[15px] font-bold">Are you a {{ modal.label }}?</h4>
            <p class="mx-auto mb-3 mt-1 max-w-sm text-xs text-muted">Join KaziHub — upload your work samples and get found by customers near you. No CV needed.</p>
            <button class="btn-primary px-4 py-2 text-[13px]">📲 List Yourself Free</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class BubbleFieldComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() query = "";
  @Input() activeCat = "all";
  @ViewChild("wrap") wrapRef!: ElementRef<HTMLDivElement>;
  @ViewChild("cv") canvasRef!: ElementRef<HTMLCanvasElement>;

  tip: ServiceDatum | null = null;
  tipLeft = 0; tipTop = 0;
  modal: ServiceDatum | null = null;
  pros: Pro[] = [];

  private data = buildServiceData();
  private bubbles: Bubble[] = [];
  private W = 0; private H = 0; private raf = 0; private frame = 0;
  private hov: Bubble | null = null;
  private drag: Bubble | null = null;
  private dragOX = 0; private dragOY = 0; private wasDrag = false;
  private ro?: ResizeObserver;
  private emojiCache: Record<string, HTMLCanvasElement> = {};

  constructor(private zone: NgZone, private cdr: ChangeDetectorRef) {}

  catLabel(cat: string) { const c = CATS[cat]; return c ? `${c.icon} ${c.label}` : cat; }
  stars(r: number) { return "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r)); }
  onBackdrop(e: MouseEvent) { if (e.target === e.currentTarget) this.modal = null; }

  ngAfterViewInit() {
    const ECS = 64;
    for (const d of this.data) {
      if (this.emojiCache[d.emoji]) continue;
      const oc = document.createElement("canvas"); oc.width = oc.height = ECS;
      const o = oc.getContext("2d")!; const fs = Math.round(ECS * 0.72);
      o.font = `${fs}px serif`; o.textAlign = "center"; o.textBaseline = "middle";
      o.fillText(d.emoji, ECS / 2, ECS / 2 + fs * 0.04); this.emojiCache[d.emoji] = oc;
    }
    this.zone.runOutsideAngular(() => {
      const canvas = this.canvasRef.nativeElement;
      canvas.addEventListener("pointermove", this.onMove);
      canvas.addEventListener("pointerdown", this.onDown);
      canvas.addEventListener("pointerup", this.onUp);
      canvas.addEventListener("pointerleave", this.onLeave);
      this.layout(); this.loop();
      this.ro = new ResizeObserver(() => { cancelAnimationFrame(this.raf); this.layout(); this.loop(); });
      this.ro.observe(this.wrapRef.nativeElement);
    });
  }

  ngOnChanges(_: SimpleChanges) { /* query/activeCat read live in applyFilter */ }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf); this.ro?.disconnect();
    const c = this.canvasRef?.nativeElement;
    if (c) { c.removeEventListener("pointermove", this.onMove); c.removeEventListener("pointerdown", this.onDown); c.removeEventListener("pointerup", this.onUp); c.removeEventListener("pointerleave", this.onLeave); }
  }

  private avgR() { return Math.sqrt((this.W * this.H * FILL_RATIO) / this.data.length / Math.PI); }
  private currentR(b: Bubble) {
    const a = this.avgR(); const minR = Math.max(8, a * MIN_MULT * 0.7);
    const maxR = Math.min(a * MAX_MULT * 1.1, Math.min(this.W, this.H) * 0.22);
    return Math.min(maxR, Math.max(minR, b.d.baseMultiplier * a));
  }
  private applyFilter() {
    const q = this.query.toLowerCase(), cat = this.activeCat;
    for (const b of this.bubbles) {
      const catOk = cat === "all" || b.d.cat === cat;
      const srOk = !q || b.d.label.toLowerCase().includes(q) || b.d.cat.includes(q);
      b.filtered = !(catOk && srOk);
    }
  }

  private layout() {
    const wrap = this.wrapRef.nativeElement, canvas = this.canvasRef.nativeElement, ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    this.W = wrap.clientWidth; this.H = wrap.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = this.W * dpr; canvas.height = this.H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const a = this.avgR(), W = this.W, H = this.H;
    const targets = this.data.map((d) => { const r = Math.max(8, d.baseMultiplier * a); return { d, r, x: rnd(r + 8, Math.max(r + 9, W - r - 8)), y: rnd(r + 8, Math.max(r + 9, H - r - 8)) }; });
    for (let pass = 0; pass < 130; pass++) {
      for (let i = 0; i < targets.length; i++) {
        for (let j = i + 1; j < targets.length; j++) {
          const p = targets[i], q = targets[j];
          const dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy, minD = p.r + q.r + 2;
          if (d2 < minD * minD && d2 > 0.01) {
            const dist = Math.sqrt(d2), nx = dx / dist, ny = dy / dist, ov = (minD - dist) * 0.5;
            p.x -= nx * ov; p.y -= ny * ov; q.x += nx * ov; q.y += ny * ov;
            p.x = Math.max(p.r + 4, Math.min(W - p.r - 4, p.x)); p.y = Math.max(p.r + 4, Math.min(H - p.r - 4, p.y));
            q.x = Math.max(q.r + 4, Math.min(W - q.r - 4, q.x)); q.y = Math.max(q.r + 4, Math.min(H - q.r - 4, q.y));
          }
        }
      }
    }
    targets.sort((p, q) => p.x - q.x);
    this.bubbles = targets.map((t, i) => {
      const startY = H + t.r + Math.random() * 60;
      return { d: t.d, x: reduce ? t.x : t.x + (Math.random() - 0.5) * 30, y: reduce ? t.y : startY, vx: 0, vy: 0, r: t.r, filtered: false, pulse: Math.random() * 6.28,
        rising: !reduce, riseTargetX: t.x, riseTargetY: t.y, riseStartY: startY, riseT: reduce ? 1 : 0, riseDelay: reduce ? 0 : Math.floor((i / targets.length) * 180) + Math.floor(Math.random() * 26),
        riseFrame: 0, riseSpeed: 0.0058 + Math.random() * 0.003, wobbleAmp: (Math.random() * 0.6 + 0.3) * t.r * 0.8, wobbleFreq: 0.8 + Math.random() * 0.6, wobblePhase: Math.random() * 6.28, scaleT: reduce ? 1 : 0 };
    });
    this.applyFilter();
  }

  private drawEmoji(ctx: CanvasRenderingContext2D, e: string, cx: number, cy: number, size: number) {
    const b = this.emojiCache[e]; if (!b) return; ctx.drawImage(b, cx - size / 2, cy - size / 2, size, size);
  }

  private draw(ctx: CanvasRenderingContext2D, b: Bubble) {
    const d = b.d, r = this.currentR(b);
    ctx.save();
    if (b.scaleT < 1) { ctx.translate(b.x, b.y); ctx.scale(b.scaleT, b.scaleT); ctx.translate(-b.x, -b.y); }
    if (b.filtered) { ctx.globalAlpha = 0.045; ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, 6.2832); ctx.fillStyle = d.color; ctx.fill(); ctx.restore(); return; }
    const cx = Math.round(b.x), cy = Math.round(b.y), isH = b === this.hov;
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.02, cx, cy, r);
    g.addColorStop(0, lighten(d.color, 0.5)); g.addColorStop(0.45, d.color); g.addColorStop(1, darken(d.color, 0.28));
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r - 0.5, 0, 6.2832); ctx.strokeStyle = "rgba(0,0,0,0.22)"; ctx.lineWidth = 1; ctx.stroke();
    if (isH) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, r + 2.5, 0, 6.2832); ctx.strokeStyle = hexRgba(d.color, 0.4); ctx.lineWidth = 3.5; ctx.stroke(); }
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
    const ct = (text: string, ty: number, fs: number, w: string, mono: boolean, col: string) => {
      ctx.font = `${w} ${fs}px ${mono ? "ui-monospace,monospace" : "system-ui,'Segoe UI',sans-serif"}`;
      ctx.lineWidth = Math.max(2, fs * 0.3); ctx.strokeStyle = "rgba(0,0,0,0.7)"; ctx.strokeText(text, cx, Math.round(ty)); ctx.fillStyle = col; ctx.fillText(text, cx, Math.round(ty));
    };
    if (r >= 38) {
      this.drawEmoji(ctx, d.emoji, cx, cy - r * 0.25, Math.max(10, r * 0.31) * 1.3);
      const fs = Math.max(7, Math.min(12, r * 0.185)), mc = Math.max(4, Math.floor((r * 1.6) / (fs * 0.6)));
      ct(d.label.length > mc ? d.label.slice(0, mc - 1) + "…" : d.label, cy + r * 0.1, fs, "700", false, "#fff");
      if (r >= 50) ct(`${d.workers} pros`, cy + r * 0.34, Math.max(6, fs - 2), "600", true, "rgba(255,255,255,0.82)");
    } else if (r >= 24) {
      this.drawEmoji(ctx, d.emoji, cx, cy - r * 0.14, Math.max(9, r * 0.44) * 1.3);
      const fs = Math.max(6, Math.min(10, r * 0.2)), mc = Math.max(3, Math.floor((r * 1.4) / (fs * 0.6)));
      ct(d.label.length > mc ? d.label.slice(0, mc - 1) + "…" : d.label, cy + r * 0.24, fs, "700", false, "#fff");
    } else if (r >= 13) {
      this.drawEmoji(ctx, d.emoji, cx, cy, Math.max(8, r * 0.56) * 1.3);
    }
    ctx.restore();
  }

  private loop = () => {
    const ctx = this.canvasRef.nativeElement.getContext("2d")!;
    ctx.clearRect(0, 0, this.W, this.H); this.frame++;
    const cx = this.W / 2, cy = this.H / 2;
    for (const b of this.bubbles) {
      if (!b.rising || b.riseFrame < b.riseDelay || b.riseT <= 0) continue;
      const vp = 0.4 + 0.35 * Math.sin(this.frame * 0.08 + b.wobblePhase);
      const vg = ctx.createRadialGradient(b.riseTargetX, this.H, 0, b.riseTargetX, this.H, 18 + b.r * 0.3);
      vg.addColorStop(0, hexRgba(b.d.color, 0.18 * vp)); vg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(b.riseTargetX, this.H, 18 + b.r * 0.3, 0, 6.2832); ctx.fillStyle = vg; ctx.fill();
    }
    for (const b of this.bubbles) {
      if (b === this.drag) continue;
      if (b.rising) {
        b.riseFrame++; if (b.riseFrame < b.riseDelay) continue;
        b.riseT = Math.min(1, b.riseT + b.riseSpeed); b.scaleT = Math.min(1, b.scaleT + b.riseSpeed * 1.2);
        const et = easeOut(b.riseT); b.y = b.riseStartY - (b.riseStartY - b.riseTargetY) * et;
        const fade = Math.pow(1 - b.riseT, 1.4); b.x = b.riseTargetX + Math.sin(b.riseT * 14 * b.wobbleFreq + b.wobblePhase) * b.wobbleAmp * fade;
        if (b.riseT >= 1) { b.rising = false; b.x = b.riseTargetX; b.y = b.riseTargetY; b.scaleT = 1; b.vx = 0; b.vy = 0; }
      } else {
        b.vx += (cx - b.x) * 0.000006; b.vy += (cy - b.y) * 0.000006; b.vx *= 0.962; b.vy *= 0.962;
        const spd = Math.hypot(b.vx, b.vy); if (spd > 0.9) { const k = 0.9 / spd; b.vx *= k; b.vy *= k; }
        b.x += b.vx; b.y += b.vy; const r = this.currentR(b);
        if (b.x - r < 0) { b.x = r; b.vx = Math.abs(b.vx); } if (b.x + r > this.W) { b.x = this.W - r; b.vx = -Math.abs(b.vx); }
        if (b.y - r < 0) { b.y = r; b.vy = Math.abs(b.vy); } if (b.y + r > this.H) { b.y = this.H - r; b.vy = -Math.abs(b.vy); }
      }
    }
    for (let i = 0; i < this.bubbles.length; i++) {
      for (let j = i + 1; j < this.bubbles.length; j++) {
        const a = this.bubbles[i], b = this.bubbles[j]; if (a.rising && b.rising) continue;
        const ar = this.currentR(a), br = this.currentR(b), dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy, minD = ar + br + 3;
        if (d2 < minD * minD && d2 > 0.01) {
          const dist = Math.sqrt(d2), nx = dx / dist, ny = dy / dist, ov = (minD - dist) * 0.045;
          if (!a.rising && a !== this.drag) { a.x -= nx * ov; a.y -= ny * ov; }
          if (!b.rising && b !== this.drag) { b.x += nx * ov; b.y += ny * ov; }
        }
      }
    }
    this.applyFilter();
    const sorted = this.bubbles.slice().sort((a, b) => this.currentR(b) - this.currentR(a));
    for (const b of sorted) this.draw(ctx, b);
    this.raf = requestAnimationFrame(this.loop);
  };

  private hitTest(mx: number, my: number): Bubble | null {
    const sm = this.bubbles.slice().sort((a, b) => this.currentR(a) - this.currentR(b));
    for (const b of sm) { if (b.filtered) continue; const r = this.currentR(b), dx = mx - b.x, dy = my - b.y; if (dx * dx + dy * dy < r * r) return b; }
    return null;
  }
  private rel(e: PointerEvent) { const rc = this.canvasRef.nativeElement.getBoundingClientRect(); return { x: e.clientX - rc.left, y: e.clientY - rc.top }; }

  private setTip(d: ServiceDatum | null, clientX = 0, clientY = 0) {
    this.tip = d;
    if (d) {
      let left = clientX + 18, top = clientY - 10;
      if (left + 256 > window.innerWidth) left = clientX - 262;
      if (top + 220 > window.innerHeight) top = clientY - 224;
      this.tipLeft = left; this.tipTop = top;
    }
    this.cdr.detectChanges();
  }

  private onMove = (e: PointerEvent) => {
    const canvas = this.canvasRef.nativeElement;
    if (this.drag) { const p = this.rel(e); this.drag.x = p.x + this.dragOX; this.drag.y = p.y + this.dragOY; this.wasDrag = true; return; }
    const p = this.rel(e), hit = this.hitTest(p.x, p.y); this.hov = hit;
    if (hit) { canvas.style.cursor = "grab"; this.setTip(hit.d, e.clientX, e.clientY); }
    else { canvas.style.cursor = "default"; this.setTip(null); }
  };
  private onDown = (e: PointerEvent) => {
    const canvas = this.canvasRef.nativeElement, p = this.rel(e), hit = this.hitTest(p.x, p.y);
    if (hit) { this.drag = hit; this.dragOX = hit.x - p.x; this.dragOY = hit.y - p.y; this.wasDrag = false; canvas.style.cursor = "grabbing"; canvas.setPointerCapture(e.pointerId); if (e.pointerType === "touch") { this.hov = hit; this.setTip(hit.d, e.clientX, e.clientY); } }
  };
  private onUp = (e: PointerEvent) => {
    if (this.drag && !this.wasDrag) this.openModal(this.drag.d);
    if (this.drag) { this.drag.vx = 0; this.drag.vy = 0; this.drag = null; }
    this.wasDrag = false; this.canvasRef.nativeElement.style.cursor = "default";
    if (e.pointerType === "touch") this.setTip(null);
  };
  private onLeave = () => { if (!this.drag) { this.hov = null; this.setTip(null); this.canvasRef.nativeElement.style.cursor = "default"; } };

  private openModal(d: ServiceDatum) {
    this.pros = Array.from({ length: 6 }, () => {
      const name = PNAMES[rnd(0, PNAMES.length - 1)], xp = rnd(200, 10000), lv = getLevel(xp);
      return { name, init: name.split(" ").map((p) => p[0]).join(""), area: AREAS[rnd(0, AREAS.length - 1)], rating: rndF(3.8, 5.0), jobs: rnd(4, 220), xp, levelName: lv.name, levelColor: lv.color };
    }).sort((a, b) => b.xp - a.xp);
    this.modal = d; this.cdr.detectChanges();
  }
}
