# KaziHub Web (Angular)

An **Angular 18** build of the KaziHub frontend — the same slices and Inngest-grade
design system as the React app in `../web`, for a side-by-side comparison.

- Angular 18 standalone components + new control flow (`@for` / `@if`) + signals
- Tailwind CSS design system (shared tokens with the React app)
- `HttpClient` fetches live `/services/bubble-data` on the Market page, with a
  graceful fallback to sample data

## Develop

```bash
npm install
npm start            # ng serve → http://localhost:4200
```

The Market page requests `/api/v1/services/bubble-data`. Point it at the backend
by proxying `/api` during dev (e.g. an Angular `proxy.conf.json` to
`http://localhost:8000`) or serving both behind one origin in production.

## Build

```bash
npm run build        # → dist/web-angular/browser
```

## Structure

```
src/app/
├── app.component.ts        Root shell: nav + <router-outlet> + footer
├── app.routes.ts           Routes for the 6 slices
├── data.ts                 Brand data + sample datasets (mirrors ../web/lib)
├── shared/                 nav, footer, page-header components
└── pages/                  home, market, hire, rentals, shop (footwear/merch)
```

## Parity with the React app

| Slice | React (`../web`) | Angular (this app) |
|-------|------------------|--------------------|
| Home | ✅ | ✅ |
| Market (bubble explorer, live API + fallback) | ✅ | ✅ |
| Hire a Pro (filterable directory) | ✅ | ✅ |
| Rentals (filter bar + cards) | ✅ | ✅ |
| Footwear / Merch (product grid) | ✅ | ✅ |

Both share the identical visual design; the difference is framework idiom —
React hooks/JSX vs Angular standalone components, signals and template control flow.
