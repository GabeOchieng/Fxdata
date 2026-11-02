import { Component, Input } from "@angular/core";

@Component({
  selector: "app-page-header",
  standalone: true,
  template: `
    <section class="relative overflow-hidden border-b border-line">
      <div class="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:40px_40px]"
           style="-webkit-mask-image:radial-gradient(ellipse 55% 60% at 50% 0%,#000 30%,transparent 100%);mask-image:radial-gradient(ellipse 55% 60% at 50% 0%,#000 30%,transparent 100%)"></div>
      <div class="pointer-events-none absolute -top-32 left-1/2 h-80 w-[720px] -translate-x-1/2 rounded-full blur-[120px]"
           [style.background]="accent + '1f'"></div>
      <div class="container-content relative py-16 sm:py-20">
        <span class="kicker">{{ kicker }}</span>
        <h1 class="mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          <ng-content></ng-content>
        </h1>
        @if (subtitle) {
          <p class="mt-4 max-w-2xl text-muted">{{ subtitle }}</p>
        }
      </div>
    </section>
  `,
})
export class PageHeaderComponent {
  @Input() kicker = "";
  @Input() subtitle = "";
  @Input() accent = "#00e5ff";
}
