// Shared brand data for the KaziHub frontend.

export const NAV_LINKS = [
  { label: "Market", href: "/market", emoji: "🗺" },
  { label: "Hire a Pro", href: "/hire", emoji: "👔" },
  { label: "Rentals", href: "/rentals", emoji: "🏠" },
  { label: "Footwear", href: "/footwear", emoji: "👟" },
  { label: "Merch", href: "/merch", emoji: "👕" },
] as const;

export type Module = {
  key: string;
  title: string;
  blurb: string;
  emoji: string;
  href: string;
  accent: string; // css color
  points: string[];
};

export const MODULES: Module[] = [
  {
    key: "market",
    title: "Skills Market",
    blurb:
      "An interactive map of 250+ service categories — from electricians and chefs to mama fuas and jua-kali artisans.",
    emoji: "🗺",
    href: "/market",
    accent: "#00e5ff",
    points: ["250+ categories", "Live bubble visualisation", "Search by area & skill"],
  },
  {
    key: "hire",
    title: "Hire a Pro",
    blurb:
      "Verified professional portfolios and storefronts. Compare ratings, packages and past work, then book instantly.",
    emoji: "👔",
    href: "/hire",
    accent: "#a78bfa",
    points: ["Rated portfolios", "Service packages", "Instant WhatsApp booking"],
  },
  {
    key: "rentals",
    title: "Rentals & Stays",
    blurb:
      "Bedsitters, apartments, shops and event spaces across Nairobi — with matatu-stage distance and honest deposits.",
    emoji: "🏠",
    href: "/rentals",
    accent: "#00ffb3",
    points: ["Nairobi-wide listings", "Matatu-stage distance", "Direct-to-landlord"],
  },
  {
    key: "footwear",
    title: "Footwear & Merch",
    blurb:
      "Locally-made sneakers, sandals and branded merch. Size × colour variants, delivered anywhere in Kenya.",
    emoji: "👟",
    href: "/footwear",
    accent: "#ff2d87",
    points: ["Size & colour variants", "Countrywide delivery", "M-Pesa checkout"],
  },
];

export type Category = { slug: string; name: string; icon: string; color: string };

// Mirrors the 21 top-level categories seeded in the backend.
export const CATEGORIES: Category[] = [
  { slug: "tech", name: "Tech & Devices", icon: "💻", color: "#00d4ff" },
  { slug: "beauty", name: "Beauty", icon: "💅", color: "#ff3d9a" },
  { slug: "food", name: "Food & Catering", icon: "🍽", color: "#ff6b2b" },
  { slug: "home", name: "Home Services", icon: "🏠", color: "#7c5cff" },
  { slug: "education", name: "Education", icon: "📚", color: "#00ffb3" },
  { slug: "events", name: "Events", icon: "🎉", color: "#ffd000" },
  { slug: "transport", name: "Transport", icon: "🚗", color: "#2b8fff" },
  { slug: "health", name: "Health & Care", icon: "❤️", color: "#ff3d5a" },
  { slug: "construction", name: "Construction", icon: "🔨", color: "#ff8c00" },
  { slug: "creative", name: "Creative & Media", icon: "🎨", color: "#c94dff" },
  { slug: "finance", name: "Finance & Legal", icon: "💰", color: "#00d26a" },
  { slug: "wellness", name: "Wellness & Sport", icon: "🧘", color: "#ff5fa0" },
  { slug: "artisan", name: "Artisan & Jua Kali", icon: "🪚", color: "#ff7043" },
  { slug: "digital", name: "Digital Hustle", icon: "📲", color: "#7c4dff" },
  { slug: "farm", name: "Agri & Farm", icon: "🌾", color: "#66bb6a" },
  { slug: "kids", name: "Kids & Family", icon: "👧", color: "#ff80ab" },
  { slug: "culture", name: "Culture & Talent", icon: "🎭", color: "#ffa726" },
  { slug: "transport2", name: "Boda & Delivery", icon: "🏍️", color: "#2b8fff" },
];

export const STATS = [
  { value: "250+", label: "Service categories" },
  { value: "2,800+", label: "Verified pros" },
  { value: "0%", label: "Agent fees" },
  { value: "M-Pesa", label: "Native checkout" },
];

export const TICKER = [
  "250 Service Categories",
  "Nairobi & Surrounding Areas",
  "WhatsApp-Native Orders",
  "M-Pesa Integrated",
  "0% Agent Fees",
  "Verified Professionals",
  "Rental Listings",
  "Footwear Catalog",
];
