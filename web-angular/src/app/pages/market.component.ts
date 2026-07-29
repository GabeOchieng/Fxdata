import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderComponent } from "../shared/page-header.component";
import { BubbleFieldComponent } from "./bubble-field.component";
import { CATS } from "../market-data";

@Component({
  selector: "app-market",
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, BubbleFieldComponent],
  template: `
    <app-page-header kicker="🗺 Skills Market" accent="#00e5ff"
      subtitle="259 hustles across 21 categories, each bubble sized by community XP. Search, filter, drag a bubble around, or click one to meet the pros.">
      Every hustle in Kenya, <span class="text-gradient">mapped live</span>
    </app-page-header>

    <div class="container-content py-8">
      <div class="relative w-full sm:max-w-sm">
        <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">🔍</span>
        <input [(ngModel)]="query" placeholder="Search a hustle — electrician, chef, mama fua…"
          class="w-full rounded-xl border border-line bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-fg outline-none transition placeholder:text-faint focus:border-brand-cyan/60" />
      </div>

      <div class="mt-4 flex gap-2 overflow-x-auto pb-1">
        <button (click)="activeCat='all'"
          class="inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition"
          [style.background]="activeCat==='all' ? '#00e5ff' : 'transparent'"
          [style.color]="activeCat==='all' ? '#04060e' : ''"
          [class.border-transparent]="activeCat==='all'" [class.border-line]="activeCat!=='all'" [class.text-muted]="activeCat!=='all'">All</button>
        @for (k of catKeys; track k) {
          <button (click)="activeCat=k"
            class="inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition"
            [style.background]="activeCat===k ? cats[k].color : 'transparent'"
            [style.color]="activeCat===k ? '#04060e' : ''"
            [class.border-transparent]="activeCat===k" [class.border-line]="activeCat!==k" [class.text-muted]="activeCat!==k">
            @if (activeCat !== k) { <span class="h-1.5 w-1.5 rounded-full" [style.background]="cats[k].color"></span> }
            {{ cats[k].icon }} {{ cats[k].label }}
          </button>
        }
      </div>

      <div class="mt-5">
        <app-bubble-field [query]="query" [activeCat]="activeCat"></app-bubble-field>
        <p class="mt-3 text-center text-xs text-faint">
          Bubble size = community XP · drag them around · hover for detail · click to see pros
        </p>
      </div>
    </div>
  `,
})
export class MarketComponent {
  query = "";
  activeCat = "all";
  cats = CATS;
  catKeys = Object.keys(CATS);
}
