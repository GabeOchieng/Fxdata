import { Component } from "@angular/core";
import { NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PageHeaderComponent } from "../shared/page-header.component";
import { Rental, RENTALS, RENTAL_TYPES, priceKES } from "../data";

@Component({
  selector: "app-rentals",
  standalone: true,
  imports: [FormsModule, NgClass, PageHeaderComponent],
  template: `
    <app-page-header kicker="🏠 Rentals & Stays" accent="#00ffb3"
      subtitle="Bedsitters to event spaces — with matatu-stage distance and honest deposits. No agent fees, enquire straight to the landlord.">
      Find your space in <span class="text-gradient">Nairobi</span>
    </app-page-header>

    <div class="container-content py-12">
      <div class="rounded-2xl border border-line bg-white/[0.02] p-5">
        <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          @for (t of types; track t.value) {
            <button (click)="type = t.value"
              class="inline-flex items-center whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition"
              [style.background]="type === t.value ? '#00e5ff' : 'transparent'"
              [style.color]="type === t.value ? '#04060e' : ''"
              [class.border-transparent]="type === t.value"
              [class.border-line]="type !== t.value"
              [class.text-muted]="type !== t.value">
              {{ t.label }}
            </button>
          }
        </div>
        <div class="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <label class="flex-1">
            <div class="mb-2 flex items-center justify-between text-xs text-muted">
              <span>Max rent</span>
              <span class="font-mono text-fg">{{ price(maxPrice) }}/mo</span>
            </div>
            <input type="range" min="8000" max="100000" step="1000" [(ngModel)]="maxPrice"
              class="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-brand-cyan" />
          </label>

          <button (click)="furnishedOnly = !furnishedOnly"
            class="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition"
            [ngClass]="furnishedOnly ? 'border-brand-green/50 bg-brand-green/10 text-brand-green' : 'border-line text-muted'">
            <span class="flex h-4 w-4 items-center justify-center rounded text-[10px]"
                  [ngClass]="furnishedOnly ? '' : 'border border-line2'"
                  [style.background]="furnishedOnly ? '#00ffb3' : 'transparent'"
                  [style.color]="furnishedOnly ? '#04060e' : ''">{{ furnishedOnly ? '✓' : '' }}</span>
            Furnished only
          </button>

          <select [(ngModel)]="sort"
            class="rounded-xl border border-line bg-ink-900 px-4 py-2.5 text-sm text-fg outline-none focus:border-brand-cyan/60">
            <option value="featured">Sort: Featured</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      <div class="mt-4 text-xs text-muted"><b class="font-mono text-fg">{{ visible().length }}</b> homes available</div>

      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (r of visible(); track r.id) {
          <article class="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.02] transition hover:border-line2 hover:bg-white/[0.04]">
            <div class="relative h-40 w-full"
                 [style.background]="'linear-gradient(135deg,' + r.accent + '22, transparent 60%), radial-gradient(circle at 70% 20%,' + r.accent + '33, transparent 55%)'">
              <div class="absolute inset-0 bg-grid-faint bg-[size:26px_26px] opacity-40"></div>
              <span class="absolute left-3 top-3 rounded-full border border-line2 bg-ink-950/70 px-2.5 py-1 text-[11px] font-semibold text-fg backdrop-blur">{{ r.typeLabel }}</span>
              @if (r.furnished) {
                <span class="absolute right-3 top-3 rounded-full border border-brand-green/40 bg-brand-green/15 px-2.5 py-1 text-[10px] font-bold uppercase text-brand-green">Furnished</span>
              }
              <span class="absolute bottom-3 right-3 text-4xl opacity-70">🏠</span>
            </div>
            <div class="flex flex-1 flex-col p-5">
              <h3 class="font-semibold leading-tight text-fg">{{ r.title }}</h3>
              <div class="mt-1 text-xs text-muted">📍 {{ r.area }}</div>
              <div class="mt-3 flex flex-wrap gap-1.5">
                @if (r.beds > 0) {
                  <span class="rounded-md border border-line px-2 py-0.5 text-[11px] text-muted">🛏 {{ r.beds }} bed</span>
                }
                <span class="rounded-md border border-line px-2 py-0.5 text-[11px] text-muted">🚿 {{ r.baths }} bath</span>
                <span class="rounded-md border border-line px-2 py-0.5 text-[11px] text-muted">🚐 {{ r.matatuStage }} · {{ r.matatuMins }}m</span>
              </div>
              <div class="mt-3 flex flex-wrap gap-1.5">
                @for (a of r.amenities.slice(0, 3); track a) {
                  <span class="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-muted">{{ a }}</span>
                }
              </div>
              <div class="mt-auto flex items-end justify-between border-t border-line pt-4">
                <div>
                  <div class="font-display text-xl font-bold text-fg">{{ price(r.price) }}<span class="text-xs font-normal text-muted">/mo</span></div>
                  <div class="text-[11px] text-faint">Deposit {{ price(r.deposit) }}</div>
                </div>
                <span class="wa-btn">💬 Enquire</span>
              </div>
            </div>
          </article>
        }
      </div>

      @if (visible().length === 0) {
        <p class="mt-16 text-center text-sm text-muted">No homes match those filters. Try raising the max rent.</p>
      }
    </div>
  `,
})
export class RentalsComponent {
  types = RENTAL_TYPES;
  type = "all";
  furnishedOnly = false;
  maxPrice = 100000;
  sort: "featured" | "price_asc" | "price_desc" = "featured";

  visible(): Rental[] {
    let list = RENTALS.filter(
      (r) =>
        (this.type === "all" || r.type === this.type) &&
        (!this.furnishedOnly || r.furnished) &&
        r.price <= this.maxPrice
    );
    if (this.sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (this.sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }
  price(n: number): string { return priceKES(n); }
}
