import { Component, OnInit, signal } from "@angular/core";
import { NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { PageHeaderComponent } from "../shared/page-header.component";
import { BubbleDatum, CATEGORIES } from "../data";

interface Cell {
  slug: string; name: string; icon: string; color: string;
  listings: number; workers: number; xp: number;
}

function seeded(slug: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 100000;
  return h;
}
function fallbackCells(): Cell[] {
  return CATEGORIES.map((c) => {
    const listings = 40 + (seeded(c.slug, 7) % 260);
    return {
      slug: c.slug, name: c.name, icon: c.icon, color: c.color,
      listings, workers: listings + (seeded(c.slug, 13) % 400), xp: 2500 + (seeded(c.slug, 29) % 7000),
    };
  });
}

@Component({
  selector: "app-market",
  standalone: true,
  imports: [FormsModule, NgClass, PageHeaderComponent],
  template: `
    <app-page-header kicker="🗺 Skills Market" accent="#00e5ff"
      subtitle="250+ categories sized by real activity — pros, jobs done and community XP. Search a trade or tap a category to find talent near you.">
      Every trade in Kenya, <span class="text-gradient">mapped live</span>
    </app-page-header>

    <div class="container-content py-12">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative w-full sm:max-w-sm">
          <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">🔍</span>
          <input [(ngModel)]="query" placeholder="Search a trade — electrician, chef, mama fua…"
            class="w-full rounded-xl border border-line bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-fg outline-none transition placeholder:text-faint focus:border-brand-cyan/60" />
        </div>
        <div class="flex items-center gap-4 text-xs text-muted">
          <span><b class="font-mono text-fg">{{ cells().length }}</b> categories</span>
          <span><b class="font-mono text-fg">{{ totalWorkers() }}</b> pros</span>
          <span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
                [ngClass]="live() ? 'border-brand-green/40 text-brand-green' : 'border-line text-faint'">
            <span class="h-1.5 w-1.5 rounded-full" [ngClass]="live() ? 'bg-brand-green' : 'bg-faint'"></span>
            {{ live() ? 'Live API' : 'Sample data' }}
          </span>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        @for (c of filtered(); track c.slug) {
          <a href="#" class="group relative overflow-hidden rounded-2xl border border-line bg-white/[0.02] p-5 transition hover:border-line2 hover:bg-white/[0.05]">
            <div class="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-[45px]"
                 [style.background]="c.color" [style.opacity]="(c.xp / maxXp()) * 0.2"></div>
            <div class="flex items-center justify-between">
              <span class="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                    [style.background]="c.color + '18'" [style.border]="'1px solid ' + c.color + '40'">{{ c.icon }}</span>
              <span class="font-mono text-[11px] text-faint">{{ c.listings }} listings</span>
            </div>
            <h3 class="mt-4 font-semibold leading-tight text-fg">{{ c.name }}</h3>
            <div class="mt-3 flex items-center justify-between text-[11px] text-muted">
              <span>{{ c.workers.toLocaleString() }} pros</span>
              <span class="font-mono" [style.color]="c.color">{{ c.xp.toLocaleString() }} XP</span>
            </div>
            <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
              <div class="h-full rounded-full" [style.width]="(c.xp / maxXp()) * 100 + '%'" [style.background]="c.color"></div>
            </div>
          </a>
        }
      </div>

      @if (filtered().length === 0) {
        <p class="mt-16 text-center text-sm text-muted">No categories match "{{ query }}". Try another trade.</p>
      }
    </div>
  `,
})
export class MarketComponent implements OnInit {
  cells = signal<Cell[]>(fallbackCells());
  live = signal(false);
  query = "";

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<BubbleDatum[]>("/api/v1/services/bubble-data").subscribe({
      next: (rows) => {
        if (rows?.length) {
          const byslug = new Map(this.cells().map((c) => [c.slug, c]));
          for (const r of rows) {
            const base = byslug.get(r.slug);
            if (base) {
              byslug.set(r.slug, {
                ...base,
                listings: r.listings || base.listings,
                workers: r.workers || base.workers,
                xp: r.xp || base.xp,
              });
            }
          }
          this.cells.set([...byslug.values()]);
          this.live.set(true);
        }
      },
      error: () => {},
    });
  }

  maxXp(): number {
    return Math.max(...this.cells().map((c) => c.xp), 1);
  }
  totalWorkers(): string {
    return this.cells().reduce((a, c) => a + c.workers, 0).toLocaleString();
  }
  filtered(): Cell[] {
    const needle = this.query.trim().toLowerCase();
    const list = needle ? this.cells().filter((c) => c.name.toLowerCase().includes(needle)) : this.cells();
    return [...list].sort((a, b) => b.xp - a.xp);
  }
}
