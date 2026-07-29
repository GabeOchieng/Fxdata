# KaziHub Web

Premium React frontend for KaziHub, built to an Inngest-grade standard.

- **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS** · **Framer Motion**
- Dark, high-contrast design system with the KaziHub brand palette
- Talks to the FastAPI backend (`../backend`) via a dev rewrite proxy

## Develop

```bash
npm install
cp .env.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                    # http://localhost:3000
```

`/api/*` requests are rewritten to `NEXT_PUBLIC_API_URL` so the frontend and API
share an origin in development (see `next.config.mjs`).

## Build

```bash
npm run build && npm run start
```

## Structure

```
app/
├── layout.tsx          Root layout: fonts, global nav + footer
├── page.tsx            Home (Hero, Modules, How-it-works, Categories, CTA)
├── globals.css         Design tokens + component utilities
└── {market,hire,rentals,footwear,merch}/page.tsx   scaffolded routes
components/
├── site-nav.tsx, site-footer.tsx, logo.tsx, reveal.tsx
└── home/               hero, ticker, modules, how-it-works, categories, cta
lib/
├── constants.ts        nav links, modules, categories, stats
└── api.ts              typed client for the KaziHub API
```

## Design system

- Tokens: `tailwind.config.ts` (`ink`, `brand`, `line`, `fg`, `muted`…) and CSS
  variables in `globals.css`.
- Utilities: `.container-content`, `.kicker`, `.text-gradient`, `.surface`,
  `.btn-primary`, `.btn-ghost`, grid/aurora backdrops.
- Fonts: Inter (sans), Space Grotesk (display), JetBrains Mono (mono).

## Status

Home page is production-polished. The four marketplace routes are scaffolded
with a shared "in build" state and will be migrated from the static prototype in
`../frontend`, wired to the live API (`lib/api.ts`).
