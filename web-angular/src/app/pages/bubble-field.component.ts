import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";

export interface BubbleCell {
  slug: string;
  name: string;
  icon: string;
  color: string;
  listings: number;
  workers: number;
  xp: number;
}

interface Bubble {
  cell: BubbleCell;
  x: number; y: number; vx: number; vy: number;
  r: number; targetR: number; tx: number; ty: number;
  rising: boolean; riseT: number; riseFrame: number; riseDelay: number;
  riseSpeed: number; riseStartY: number;
  wobbleAmp: number; wobbleFreq: number; wobblePhase: number;
  scaleT: number; pulse: number; dim: number;
}

interface Tip { x: number; y: number; cell: BubbleCell; }

function hexRgba(hex: string, a: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);

@Component({
  selector: "app-bubble-field",
  standalone: true,
  template: `
    <div #wrap class="relative h-[64vh] min-h-[440px] w-full overflow-hidden rounded-3xl border border-line bg-[rgba(2,5,12,0.5)]"
         style="touch-action:pan-y">
      <div class="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:40px_40px] opacity-40"></div>
      <canvas #cv class="relative block"
        (pointermove)="onMove($event)"
        (pointerdown)="onDown($event)"
        (pointerleave)="onLeave()"
        (click)="onClick($event)"></canvas>
      @if (tip) {
        <div class="pointer-events-none absolute z-20 w-56 -translate-x-1/2 rounded-xl border border-line2 bg-ink-900/95 p-3.5 shadow-2xl backdrop-blur"
             [style.left.px]="tipLeft()" [style.top.px]="tip.y - 128">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ tip.cell.icon }}</span>
            <span class="font-semibold text-fg">{{ tip.cell.name }}</span>
          </div>
          <div class="mt-2.5 space-y-1.5 text-xs">
            <div class="flex items-center justify-between"><span class="text-muted">Listings</span>
              <span class="font-mono font-semibold text-fg">{{ tip.cell.listings.toLocaleString() }}</span></div>
            <div class="flex items-center justify-between"><span class="text-muted">Professionals</span>
              <span class="font-mono font-semibold text-fg">{{ tip.cell.workers.toLocaleString() }}</span></div>
            <div class="flex items-center justify-between"><span class="text-muted">Community XP</span>
              <span class="font-mono font-semibold" [style.color]="tip.cell.color">{{ round(tip.cell.xp).toLocaleString() }}</span></div>
          </div>
          <div class="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div class="h-full rounded-full" [style.width.%]="pct(tip.cell.xp)" [style.background]="tip.cell.color"></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class BubbleFieldComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() cells: BubbleCell[] = [];
  @Input() query = "";
  @Output() select = new EventEmitter<string>();

  @ViewChild("wrap") wrapRef!: ElementRef<HTMLDivElement>;
  @ViewChild("cv") canvasRef!: ElementRef<HTMLCanvasElement>;

  tip: Tip | null = null;

  private bubbles: Bubble[] = [];
  private W = 0; private H = 0; private dpr = 1; private raf = 0; private frame = 0;
  private hover: Bubble | null = null;
  private ro?: ResizeObserver;
  private ready = false;
  private lastTap: string | null = null;

  ngAfterViewInit() {
    this.ready = true;
    this.build();
    this.ro = new ResizeObserver(() => this.layout());
    this.ro.observe(this.wrapRef.nativeElement);
    this.loop();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Only relayout when the data set changes — never on query keystrokes,
    // which are read live inside the animation loop.
    if (this.ready && changes["cells"]) this.layout();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
  }

  private build() {
    this.layout();
  }

  private layout() {
    const wrap = this.wrapRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!wrap || !canvas || this.cells.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    this.W = wrap.clientWidth;
    this.H = wrap.clientHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = this.W * this.dpr;
    canvas.height = this.H * this.dpr;
    canvas.style.width = this.W + "px";
    canvas.style.height = this.H + "px";
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const W = this.W, H = this.H;
    const raw = this.cells.map((c) => Math.sqrt(Math.max(1, c.xp)));
    const sumSq = raw.reduce((a, r) => a + r * r, 0);
    const fill = W < 560 ? 0.44 : 0.52;
    const s = Math.sqrt((fill * W * H) / (Math.PI * sumSq));
    const minR = Math.max(W < 560 ? 20 : 26, Math.min(W, H) * 0.05);
    const maxR = Math.min(W, H) * 0.19;
    const radii = raw.map((r) => Math.max(minR, Math.min(maxR, r * s)));

    const targets = this.cells.map((c, i) => ({
      c, r: radii[i],
      x: radii[i] + 8 + Math.random() * (W - 2 * radii[i] - 16),
      y: radii[i] + 8 + Math.random() * (H - 2 * radii[i] - 16),
    }));
    for (let pass = 0; pass < 160; pass++) {
      for (let i = 0; i < targets.length; i++) {
        for (let j = i + 1; j < targets.length; j++) {
          const a = targets[i], b = targets[j];
          const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy, minD = a.r + b.r + 4;
          if (d2 < minD * minD && d2 > 0.01) {
            const dist = Math.sqrt(d2), nx = dx / dist, ny = dy / dist, ov = (minD - dist) * 0.5;
            a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
          }
        }
        targets[i].x = Math.max(targets[i].r + 4, Math.min(W - targets[i].r - 4, targets[i].x));
        targets[i].y = Math.max(targets[i].r + 4, Math.min(H - targets[i].r - 4, targets[i].y));
      }
    }
    targets.sort((a, b) => a.x - b.x);

    this.bubbles = targets.map((t, i) => {
      const startY = H + t.r + Math.random() * 60;
      return {
        cell: t.c, x: reduced ? t.x : t.x + (Math.random() - 0.5) * 30, y: reduced ? t.y : startY,
        vx: 0, vy: 0, r: reduced ? t.r : 0, targetR: t.r, tx: t.x, ty: t.y,
        rising: !reduced, riseT: reduced ? 1 : 0, riseFrame: 0,
        riseDelay: reduced ? 0 : Math.floor((i / targets.length) * 150) + Math.floor(Math.random() * 24),
        riseSpeed: 0.006 + Math.random() * 0.003, riseStartY: startY,
        wobbleAmp: (Math.random() * 0.6 + 0.3) * t.r * 0.8, wobbleFreq: 0.8 + Math.random() * 0.6,
        wobblePhase: Math.random() * Math.PI * 2, scaleT: reduced ? 1 : 0,
        pulse: Math.random() * Math.PI * 2, dim: 0,
      };
    });
  }

  private step() {
    const cx = this.W / 2, cy = this.H / 2, q = this.query.trim().toLowerCase();
    for (const b of this.bubbles) {
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
        if (b.riseT >= 1) { b.rising = false; b.x = b.tx; b.y = b.ty; b.r = b.targetR; }
      } else {
        b.r = b.targetR;
        b.vx += (cx - b.x) * 0.000006; b.vy += (cy - b.y) * 0.000006;
        b.vx *= 0.962; b.vy *= 0.962;
        const spd = Math.hypot(b.vx, b.vy);
        if (spd > 0.9) { const k = 0.9 / spd; b.vx *= k; b.vy *= k; }
        b.x += b.vx; b.y += b.vy;
        if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx); }
        if (b.x + b.r > this.W) { b.x = this.W - b.r; b.vx = -Math.abs(b.vx); }
        if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy); }
        if (b.y + b.r > this.H) { b.y = this.H - b.r; b.vy = -Math.abs(b.vy); }
      }
    }
    for (let i = 0; i < this.bubbles.length; i++) {
      for (let j = i + 1; j < this.bubbles.length; j++) {
        const a = this.bubbles[i], b = this.bubbles[j];
        if (a.rising && b.rising) continue;
        const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy, minD = a.r + b.r + 4;
        if (d2 < minD * minD && d2 > 0.01) {
          const dist = Math.sqrt(d2), nx = dx / dist, ny = dy / dist, ov = (minD - dist) * 0.04;
          if (!a.rising) { a.x -= nx * ov; a.y -= ny * ov; }
          if (!b.rising) { b.x += nx * ov; b.y += ny * ov; }
        }
      }
    }
  }

  private draw() {
    const ctx = this.canvasRef.nativeElement.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, this.W, this.H);
    this.frame++;
    const order = this.bubbles.slice().sort((a, b) => b.r - a.r);
    for (const b of order) {
      const r = b.r;
      if (r < 1) continue;
      const alpha = 1 - b.dim * 0.82;
      const isH = b === this.hover;
      const col = b.cell.color;
      const rr = r * (1 + Math.sin(this.frame * 0.05 + b.pulse) * 0.012);
      if (isH) { ctx.beginPath(); ctx.arc(b.x, b.y, rr + 6, 0, 7); ctx.fillStyle = hexRgba(col, 0.14 * alpha); ctx.fill(); }
      const g = ctx.createRadialGradient(b.x - rr * 0.32, b.y - rr * 0.36, rr * 0.1, b.x, b.y, rr);
      g.addColorStop(0, hexRgba(col, (isH ? 0.42 : 0.30) * alpha));
      g.addColorStop(0.6, hexRgba(col, (isH ? 0.20 : 0.13) * alpha));
      g.addColorStop(1, hexRgba(col, 0.03 * alpha));
      ctx.beginPath(); ctx.arc(b.x, b.y, rr, 0, 7); ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = isH ? 2 : 1; ctx.strokeStyle = hexRgba(col, (isH ? 0.9 : 0.5) * alpha); ctx.stroke();
      ctx.beginPath(); ctx.arc(b.x - rr * 0.3, b.y - rr * 0.34, rr * 0.5, 0, 7); ctx.fillStyle = hexRgba("#ffffff", 0.05 * alpha); ctx.fill();
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const eSize = Math.max(12, rr * 0.5);
      if (rr > 30) {
        ctx.globalAlpha = alpha;
        ctx.font = `${eSize}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
        ctx.fillText(b.cell.icon, b.x, b.y - rr * 0.16);
        ctx.globalAlpha = 1;
        const fs = Math.max(9, Math.min(13, rr * 0.2));
        ctx.font = `600 ${fs}px system-ui,'Segoe UI',sans-serif`;
        ctx.fillStyle = hexRgba("#f0eee8", 0.92 * alpha);
        const lab = b.cell.name.length > 16 ? b.cell.name.slice(0, 15) + "…" : b.cell.name;
        ctx.fillText(lab, b.x, b.y + rr * 0.34);
        if (rr > 52) {
          ctx.font = `600 ${Math.max(8, fs * 0.8)}px ui-monospace,monospace`;
          ctx.fillStyle = hexRgba(col, 0.95 * alpha);
          ctx.fillText(`${Math.round(b.cell.xp).toLocaleString()} XP`, b.x, b.y + rr * 0.56);
        }
      } else {
        ctx.globalAlpha = alpha;
        ctx.font = `${eSize}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
        ctx.fillText(b.cell.icon, b.x, b.y);
        ctx.globalAlpha = 1;
      }
    }
  }

  private loop = () => {
    this.step();
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private pick(clientX: number, clientY: number): Bubble | null {
    const rc = this.canvasRef.nativeElement.getBoundingClientRect();
    const mx = clientX - rc.left, my = clientY - rc.top;
    const order = this.bubbles.slice().sort((a, b) => a.r - b.r);
    for (const b of order) {
      if (b.dim > 0.6) continue;
      const dx = mx - b.x, dy = my - b.y;
      if (dx * dx + dy * dy < b.r * b.r) return b;
    }
    return null;
  }

  private showTip(b: Bubble | null, clientX: number, clientY: number) {
    this.hover = b;
    this.canvasRef.nativeElement.style.cursor = b ? "pointer" : "default";
    if (b) {
      const rc = this.wrapRef.nativeElement.getBoundingClientRect();
      this.tip = { x: clientX - rc.left, y: clientY - rc.top, cell: b.cell };
    } else {
      this.tip = null;
    }
  }

  onMove(e: PointerEvent) { this.showTip(this.pick(e.clientX, e.clientY), e.clientX, e.clientY); }
  onDown(e: PointerEvent) {
    const b = this.pick(e.clientX, e.clientY);
    if (e.pointerType === "touch") {
      if (b && this.lastTap === b.cell.slug) { this.lastTap = null; this.tip = null; this.select.emit(b.cell.slug); }
      else { this.lastTap = b ? b.cell.slug : null; this.showTip(b, e.clientX, e.clientY); }
    }
  }
  onLeave() { this.hover = null; this.tip = null; }
  onClick(e: MouseEvent) {
    if ((e as PointerEvent).pointerType === "touch") return;
    const b = this.pick(e.clientX, e.clientY);
    if (b) this.select.emit(b.cell.slug);
  }

  tipLeft(): number {
    if (!this.tip) return 0;
    const w = this.wrapRef?.nativeElement.clientWidth ?? 400;
    return Math.max(120, Math.min(w - 120, this.tip.x));
  }
  round(n: number): number { return Math.round(n); }
  pct(xp: number): number { return Math.min(100, (xp / 10000) * 100); }
}
