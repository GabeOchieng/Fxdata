import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CATEGORIES, MODULES, STATS, STEPS, TICKER } from "../data";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- HERO -->
    <section class="relative overflow-hidden">
      <div class="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:44px_44px]"
           style="-webkit-mask-image:radial-gradient(ellipse 60% 55% at 50% 35%,#000 35%,transparent 100%);mask-image:radial-gradient(ellipse 60% 55% at 50% 35%,#000 35%,transparent 100%)"></div>
      <div class="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand-cyan/[0.10] blur-[120px]"></div>
      <div class="pointer-events-none absolute right-[8%] top-24 h-[280px] w-[280px] rounded-full bg-brand-magenta/[0.08] blur-[110px]"></div>

      <div class="container-content relative flex flex-col items-center pb-16 pt-20 text-center sm:pt-28">
        <span class="kicker">
          <span class="h-1.5 w-1.5 rounded-full bg-brand-green" style="box-shadow:0 0 8px #00ffb3"></span>
          Kenya's Gig Economy Platform
        </span>
        <h1 class="mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
          Every hustle.<br /><span class="text-gradient">One platform.</span>
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Find a skilled pro, rent a space, or buy locally-made footwear across
          <span class="text-fg">250+ service categories</span> in Nairobi — all connected,
          WhatsApp-native, and powered by M-Pesa. Zero agent fees.
        </p>
        <div class="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <a routerLink="/market" class="btn-primary">🗺 Explore the market</a>
          <a routerLink="/hire" class="btn-ghost">👔 Hire a pro</a>
        </div>
        <div class="mt-16 grid w-full max-w-3xl grid-cols-2 divide-x divide-line rounded-2xl border border-line bg-white/[0.02] sm:grid-cols-4">
          @for (s of stats; track s.label) {
            <div class="px-4 py-5">
              <div class="font-display text-2xl font-bold text-fg">{{ s.value }}</div>
              <div class="mt-1 text-xs text-muted">{{ s.label }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- TICKER -->
    <div class="relative overflow-hidden border-y border-line bg-ink-900/50 py-3">
      <div class="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        @for (t of tickerDouble; track $index) {
          <span class="flex items-center gap-3 font-mono text-xs text-muted">
            <span class="h-1.5 w-1.5 rounded-full bg-brand-cyan/70"></span>{{ t }}
          </span>
        }
      </div>
    </div>

    <!-- MODULES -->
    <section class="container-content py-24">
      <div class="mx-auto max-w-2xl text-center">
        <span class="kicker">Four marketplaces · one login</span>
        <h2 class="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">One platform for the whole hustle</h2>
        <p class="mt-4 text-muted">Services, professionals, rentals and commerce — unified under shared identity, ratings and a WhatsApp-native checkout.</p>
      </div>
      <div class="mt-14 grid gap-5 md:grid-cols-2">
        @for (m of modules; track m.key) {
          <a [routerLink]="m.href" class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.02] p-7 transition duration-300 hover:border-line2 hover:bg-white/[0.04]">
            <div class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-0 blur-[70px] transition-opacity duration-300 group-hover:opacity-100" [style.background]="m.accent"></div>
            <div class="flex h-12 w-12 items-center justify-center rounded-xl border text-2xl"
                 [style.border-color]="m.accent + '44'" [style.background]="m.accent + '14'">{{ m.emoji }}</div>
            <h3 class="mt-5 font-display text-2xl font-bold">{{ m.title }}</h3>
            <p class="mt-2 max-w-md text-sm leading-relaxed text-muted">{{ m.blurb }}</p>
            <ul class="mt-5 flex flex-wrap gap-2">
              @for (p of m.points; track p) {
                <li class="rounded-full border border-line px-3 py-1 text-xs text-muted">{{ p }}</li>
              }
            </ul>
            <span class="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold" [style.color]="m.accent">
              Open {{ m.title }} →
            </span>
          </a>
        }
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="relative border-y border-line bg-ink-900/40">
      <div class="container-content py-24">
        <div class="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span class="kicker">Built for how Kenya transacts</span>
            <h2 class="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              WhatsApp-native.<br /><span class="text-gradient">M-Pesa-powered.</span>
            </h2>
            <p class="mt-4 max-w-md text-muted">No downloads, no agent fees, no friction. KaziHub meets people on the tools they already use every day.</p>
          </div>
          <ol class="space-y-4">
            @for (s of steps; track s.n) {
              <li class="flex gap-5 rounded-2xl border border-line bg-white/[0.02] p-6 transition hover:border-line2 hover:bg-white/[0.04]">
                <div class="font-mono text-sm font-semibold" [style.color]="s.accent">{{ s.n }}</div>
                <div>
                  <h3 class="font-display text-xl font-bold">{{ s.title }}</h3>
                  <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ s.body }}</p>
                </div>
              </li>
            }
          </ol>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="container-content py-24">
      <div class="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div class="max-w-xl">
          <span class="kicker">250+ categories &amp; counting</span>
          <h2 class="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">If it's a hustle, it's here</h2>
        </div>
        <a routerLink="/market" class="btn-ghost whitespace-nowrap px-4 py-2.5 text-[13px]">See the full map →</a>
      </div>
      <div class="mt-12 flex flex-wrap gap-3">
        @for (c of categories; track c.slug) {
          <div class="group flex items-center gap-2.5 rounded-full border border-line bg-white/[0.02] px-4 py-2.5 text-sm text-muted transition hover:border-line2 hover:text-fg">
            <span class="h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125" [style.background]="c.color" [style.box-shadow]="'0 0 10px ' + c.color + '66'"></span>
            <span class="text-base leading-none">{{ c.icon }}</span>{{ c.name }}
          </div>
        }
      </div>
    </section>

    <!-- CTA -->
    <section class="container-content pb-8">
      <div class="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-white/[0.05] to-white/[0.01] px-8 py-16 text-center">
        <div class="pointer-events-none absolute -top-24 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-brand-cyan/[0.12] blur-[100px]"></div>
        <div class="relative">
          <h2 class="mx-auto max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">Ready to turn your skill into income?</h2>
          <p class="mx-auto mt-4 max-w-xl text-muted">List your service in minutes. Get discovered, take orders on WhatsApp, and get paid with M-Pesa — with zero agent fees.</p>
          <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a routerLink="/hire" class="btn-primary">List your service</a>
            <a routerLink="/market" class="btn-ghost">Browse the market</a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent {
  stats = STATS;
  modules = MODULES;
  steps = STEPS;
  categories = CATEGORIES;
  tickerDouble = [...TICKER, ...TICKER];
}
