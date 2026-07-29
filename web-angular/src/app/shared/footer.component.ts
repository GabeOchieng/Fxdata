import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NAV_LINKS } from "../data";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="mt-24 border-t border-line bg-ink-950/60">
      <div class="container-content grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div class="space-y-4">
          <a routerLink="/" class="inline-flex items-center gap-2 font-display text-lg font-bold">
            <span class="h-2.5 w-2.5 rounded-full bg-brand-cyan"></span>
            <span class="text-fg">Kazi<span class="text-brand-cyan">Hub</span></span>
          </a>
          <p class="max-w-xs text-sm text-muted">
            Kenya's gig economy platform. Every hustle, one place — WhatsApp-native and M-Pesa-powered.
          </p>
        </div>
        <div>
          <h4 class="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">Marketplaces</h4>
          <ul class="space-y-2 text-sm">
            @for (l of links; track l.href) {
              <li><a [routerLink]="l.href" class="text-muted transition-colors hover:text-fg">{{ l.label }}</a></li>
            }
          </ul>
        </div>
        <div>
          <h4 class="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">Company</h4>
          <ul class="space-y-2 text-sm">
            @for (x of company; track x) {
              <li><span class="cursor-default text-muted transition-colors hover:text-fg">{{ x }}</span></li>
            }
          </ul>
        </div>
        <div>
          <h4 class="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">Powered by</h4>
          <ul class="space-y-2 text-sm text-muted">
            <li>💚 M-Pesa · Daraja API</li>
            <li>💬 WhatsApp Business</li>
            <li>📍 Nairobi, Kenya</li>
          </ul>
        </div>
      </div>
      <div class="border-t border-line">
        <div class="container-content flex flex-col items-center justify-between gap-3 py-6 text-xs text-faint sm:flex-row">
          <span>© {{ year }} KaziHub · Built on the hustle 🇰🇪</span>
          <span class="font-mono">Nairobi · Kenya</span>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  links = NAV_LINKS;
  company = ["About", "For Pros", "Pricing", "Contact"];
  year = new Date().getFullYear();
}
