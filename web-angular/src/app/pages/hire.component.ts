import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderComponent } from "../shared/page-header.component";
import { Pro, PROS, PRO_FILTERS, priceKES } from "../data";

@Component({
  selector: "app-hire",
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <app-page-header kicker="👔 Hire a Pro" accent="#a78bfa"
      subtitle="Compare ratings, community level and rates — then book instantly on WhatsApp. Every pro is reviewed by the people they've served.">
      Verified pros, <span class="text-gradient">ready to work</span>
    </app-page-header>

    <div class="container-content py-12">
      <div class="flex flex-col gap-4">
        <div class="relative w-full sm:max-w-sm">
          <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">🔍</span>
          <input [(ngModel)]="query" placeholder="Search name, service or area…"
            class="w-full rounded-xl border border-line bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-fg outline-none transition placeholder:text-faint focus:border-brand-cyan/60" />
        </div>
        <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          @for (f of filters; track f.slug) {
            <button (click)="filter = f.slug"
              class="inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition"
              [style.background]="filter === f.slug ? f.color : 'transparent'"
              [style.color]="filter === f.slug ? '#04060e' : ''"
              [class.border-transparent]="filter === f.slug"
              [class.border-line]="filter !== f.slug"
              [class.text-muted]="filter !== f.slug">
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (p of visible(); track p.id) {
          <article class="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.02] p-5 transition hover:border-line2 hover:bg-white/[0.04]">
            @if (p.featured) {
              <span class="absolute right-4 top-4 rounded-full border border-brand-amber/40 bg-brand-amber/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-amber">★ Featured</span>
            }
            <div class="flex items-center gap-3">
              <span class="flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold text-ink-950" [style.background]="p.accent">{{ p.initials }}</span>
              <div class="min-w-0">
                <h3 class="truncate font-semibold text-fg">{{ p.name }}</h3>
                <p class="truncate text-xs text-muted">{{ p.title }}</p>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <span class="inline-flex items-center gap-1 text-brand-amber">
                <span class="tracking-[-1px]">{{ stars(p.rating) }}<span class="text-faint">{{ starsEmpty(p.rating) }}</span></span>
                <span class="text-xs font-semibold text-fg">{{ p.rating.toFixed(1) }}</span>
              </span>
              <span class="text-xs text-muted">{{ p.reviews }} reviews</span>
            </div>

            <div class="mt-4 flex items-center gap-2 text-xs text-muted">
              <span class="rounded-full border border-line px-2.5 py-1">📍 {{ p.area }}</span>
              <span class="rounded-full border px-2.5 py-1" [style.border-color]="p.accent + '55'" [style.color]="p.accent">{{ p.category }}</span>
            </div>

            <div class="mt-4">
              <div class="mb-1.5 flex items-center justify-between text-[11px] text-muted">
                <span>{{ p.level }} · {{ p.jobs }} jobs</span>
                <span class="font-mono" [style.color]="p.accent">{{ p.xp.toLocaleString() }} XP</span>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <div class="h-full rounded-full" [style.width]="barWidth(p) + '%'" [style.background]="'linear-gradient(90deg,' + p.accent + ',#00ffb3)'"></div>
              </div>
            </div>

            <div class="mt-5 flex items-center justify-between border-t border-line pt-4">
              <div>
                <div class="text-[11px] text-faint">From</div>
                <div class="font-display text-lg font-bold text-fg">{{ price(p.priceFrom) }}</div>
              </div>
              <span class="wa-btn">💬 Book</span>
            </div>
          </article>
        }
      </div>

      @if (visible().length === 0) {
        <p class="mt-16 text-center text-sm text-muted">No pros match your filters yet.</p>
      }
    </div>
  `,
})
export class HireComponent {
  filters = PRO_FILTERS;
  filter = "all";
  query = "";

  visible(): Pro[] {
    const needle = this.query.trim().toLowerCase();
    return PROS.filter(
      (p) =>
        (this.filter === "all" || p.categorySlug === this.filter) &&
        (!needle ||
          p.name.toLowerCase().includes(needle) ||
          p.title.toLowerCase().includes(needle) ||
          p.area.toLowerCase().includes(needle))
    );
  }
  stars(r: number): string { return "★".repeat(Math.round(r)); }
  starsEmpty(r: number): string { return "★".repeat(5 - Math.round(r)); }
  barWidth(p: Pro): number { return Math.max(4, Math.min(100, (p.xp / 10000) * 100)); }
  price(n: number): string { return priceKES(n); }
}
