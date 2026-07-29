# KaziHub — Kenya's Gig Economy Platform

KaziHub is a marketplace for Kenya's **informal sector** — connecting fundis, mama
fuas, chefs, drivers, tutors, artisans (jua kali), caregivers and hundreds of other
skilled hustlers with the people and businesses who need them. The interface is a
fully self-contained static site: canvas-rendered visualisations, inline SVG, emoji
and web fonts, with no build step and no local image assets.

## Pages

| File | Nav label | What it is |
|------|-----------|------------|
| `index.html` | — | Landing entry point (redirects to Home) |
| `kazihub-home.html` | Home | Marketing / overview landing page |
| `kazihub.html` | 🗺 Market | Interactive skills-market canvas — browse 250+ service categories |
| `kazihub-store.html` | 👔 Hire a Pro | Professional portfolios & storefronts |
| `kazihub-rentals.html` | 🏠 Rentals | Rentals & stays across Nairobi |
| `kazihub-footwear.html` | 👟 Footwear | "Sole'd Out" footwear storefront |
| `kazihub-tshirt.html` | 👕 Merch | "Wear Your Hustle" merch store |
| `kazihub-docs.html` | 📋 Docs | System architecture & technical brief |

Every page shares the same top navigation bar, so any page can be opened directly.

## Running locally

No build tooling is required — the pages are plain HTML/CSS/JS. Open `index.html`
directly, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

The pages load Google Fonts over the network; everything else is embedded.
