import { Component, HostListener, signal } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NAV_LINKS } from "../data";

@Component({
  selector: "app-nav",
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header
      class="sticky top-0 z-50 transition-colors duration-300"
      [class.border-b]="true"
      [class.border-line]="scrolled()"
      [class.bg-ink-950]="scrolled()"
      [class.backdrop-blur-xl]="scrolled()"
      [class.border-transparent]="!scrolled()"
    >
      <nav class="container-content flex h-16 items-center justify-between">
        <div class="flex items-center gap-8">
          <a routerLink="/" class="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <span class="relative inline-flex h-2.5 w-2.5">
              <span class="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-brand-cyan"></span>
            </span>
            <span class="text-fg">Kazi<span class="text-brand-cyan">Hub</span></span>
          </a>
          <div class="hidden items-center gap-1 md:flex">
            @for (l of links; track l.href) {
              <a [routerLink]="l.href" routerLinkActive="bg-white/[0.06] text-fg"
                 class="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-fg">
                {{ l.label }}
              </a>
            }
          </div>
        </div>
        <div class="hidden items-center gap-3 md:flex">
          <a routerLink="/hire" class="text-sm font-medium text-muted hover:text-fg">List your service</a>
          <a routerLink="/market" class="btn-primary px-4 py-2 text-[13px]">📲 Join free</a>
        </div>
        <button (click)="open.set(!open())" aria-label="Toggle menu"
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-fg md:hidden">
          <span class="text-lg">☰</span>
        </button>
      </nav>

      @if (open()) {
        <div class="border-t border-line bg-ink-950/95 backdrop-blur-xl md:hidden">
          <div class="container-content flex flex-col gap-1 py-4">
            @for (l of links; track l.href) {
              <a [routerLink]="l.href" (click)="open.set(false)"
                 class="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted hover:bg-white/[0.04] hover:text-fg">
                <span>{{ l.emoji }}</span>{{ l.label }}
              </a>
            }
          </div>
        </div>
      }
    </header>
  `,
})
export class NavComponent {
  links = NAV_LINKS;
  scrolled = signal(false);
  open = signal(false);

  @HostListener("window:scroll")
  onScroll() {
    this.scrolled.set(window.scrollY > 8);
  }
}
