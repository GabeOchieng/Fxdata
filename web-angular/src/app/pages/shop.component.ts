import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PageHeaderComponent } from "../shared/page-header.component";
import { Product, ProductColor, PRODUCTS, priceKES } from "../data";

@Component({
  selector: "app-shop",
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header [kicker]="header.kicker" [accent]="header.accent" [subtitle]="header.subtitle">
      <span [innerHTML]="header.title"></span>
    </app-page-header>

    <div class="container-content py-12">
      <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        @for (c of categories; track c) {
          <button (click)="cat = c"
            class="inline-flex items-center whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition"
            [style.background]="cat === c ? '#00e5ff' : 'transparent'"
            [style.color]="cat === c ? '#04060e' : ''"
            [class.border-transparent]="cat === c"
            [class.border-line]="cat !== c"
            [class.text-muted]="cat !== c">
            {{ c }}
          </button>
        }
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        @for (p of visible(); track p.id) {
          <article class="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.02] transition hover:border-line2 hover:bg-white/[0.04]">
            <div class="relative flex h-52 items-center justify-center overflow-hidden"
                 [style.background]="'radial-gradient(circle at 50% 35%,' + p.accent + '26, transparent 60%)'">
              <div class="absolute inset-0 bg-grid-faint bg-[size:26px_26px] opacity-30"></div>
              <span class="text-7xl transition-transform duration-300 group-hover:scale-110">{{ kind === 'footwear' ? '👟' : '👕' }}</span>
              @if (p.badge) {
                <span class="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-950" [style.background]="p.accent">{{ p.badge }}</span>
              }
              @if (discount(p) > 0) {
                <span class="absolute right-3 top-3 rounded-full border border-brand-magenta/40 bg-brand-magenta/15 px-2.5 py-1 text-[10px] font-bold text-brand-magenta">−{{ discount(p) }}%</span>
              }
            </div>

            <div class="flex flex-1 flex-col p-5">
              <div class="flex items-center justify-between text-[11px] text-muted">
                <span>{{ p.category }}</span>
                <span class="inline-flex items-center gap-1 text-brand-amber">
                  <span class="tracking-[-1px]">{{ stars(p.rating) }}</span>
                  <span class="text-fg">{{ p.rating.toFixed(1) }}</span>
                </span>
              </div>
              <h3 class="mt-1.5 font-semibold leading-tight text-fg">{{ p.name }}</h3>

              <div class="mt-3 flex items-center gap-2">
                @for (c of p.colors; track c.name) {
                  <button [attr.aria-label]="c.name" (click)="p.selColor = c"
                    class="h-5 w-5 rounded-full border transition"
                    [style.background]="c.hex"
                    [style.box-shadow]="p.selColor?.name === c.name ? '0 0 0 2px ' + p.accent : ''"
                    [class.border-line2]="p.selColor?.name !== c.name"></button>
                }
                <span class="ml-1 text-[11px] text-muted">{{ p.selColor?.name }}</span>
              </div>

              <div class="mt-3 flex flex-wrap gap-1.5">
                @for (s of p.sizes; track s) {
                  <button (click)="p.selSize = s"
                    class="min-w-[2rem] rounded-md border px-2 py-1 text-[11px] font-semibold transition"
                    [class.border-transparent]="p.selSize === s"
                    [class.bg-fg]="p.selSize === s"
                    [class.text-ink-950]="p.selSize === s"
                    [class.border-line]="p.selSize !== s"
                    [class.text-muted]="p.selSize !== s">
                    {{ s }}
                  </button>
                }
              </div>

              <div class="mt-auto flex items-end justify-between border-t border-line pt-4">
                <div>
                  <div class="flex items-baseline gap-2">
                    <span class="font-display text-xl font-bold text-fg">{{ price(p.price) }}</span>
                    @if (p.wasPrice) {
                      <span class="text-xs text-faint line-through">{{ price(p.wasPrice) }}</span>
                    }
                  </div>
                  <div class="text-[11px] text-faint">{{ p.sold }} sold</div>
                </div>
                <button class="btn-primary px-4 py-2 text-[13px]">Add · M-Pesa</button>
              </div>
            </div>
          </article>
        }
      </div>
    </div>
  `,
})
export class ShopComponent implements OnInit {
  kind: "footwear" | "merch" = "footwear";
  cat = "All";
  categories: string[] = ["All"];

  headers = {
    footwear: {
      kicker: "👟 Footwear",
      accent: "#ff2d87",
      title: 'Locally-made kicks, <span class="text-gradient">delivered</span>',
      subtitle:
        "Sneakers and sandals crafted by Kenyan makers. Pick your size and colour, pay with M-Pesa, delivered countrywide.",
    },
    merch: {
      kicker: "👕 Merch",
      accent: "#c8ff00",
      title: 'Wear your <span class="text-gradient">hustle</span>',
      subtitle:
        "Tees, hoodies, caps and bags repping the movement. Pick your size and colour, pay with M-Pesa, delivered countrywide.",
    },
  };

  constructor(private route: ActivatedRoute) {}

  get header() {
    return this.headers[this.kind];
  }

  ngOnInit() {
    this.kind = (this.route.snapshot.data["kind"] as "footwear" | "merch") ?? "footwear";
    const items = PRODUCTS.filter((p) => p.kind === this.kind);
    this.categories = ["All", ...Array.from(new Set(items.map((p) => p.category)))];
    // Initialise per-card selections.
    for (const p of items) {
      p.selSize = p.selSize ?? p.sizes[Math.min(1, p.sizes.length - 1)];
      p.selColor = p.selColor ?? p.colors[0];
    }
  }

  visible(): Product[] {
    return PRODUCTS.filter(
      (p) => p.kind === this.kind && (this.cat === "All" || p.category === this.cat)
    );
  }
  stars(r: number): string { return "★".repeat(Math.round(r)); }
  discount(p: Product): number {
    return p.wasPrice ? Math.round(((p.wasPrice - p.price) / p.wasPrice) * 100) : 0;
  }
  price(n: number): string { return priceKES(n); }
  selColorRef(c: ProductColor) { return c; }
}
