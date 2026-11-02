// Shared brand data + sample datasets for the KaziHub Angular frontend.
// Mirrors the React app's lib/constants.ts + lib/data.ts.

export interface NavLink { label: string; href: string; emoji: string; }
export const NAV_LINKS: NavLink[] = [
  { label: "Market", href: "/market", emoji: "🗺" },
  { label: "Hire a Pro", href: "/hire", emoji: "👔" },
  { label: "Rentals", href: "/rentals", emoji: "🏠" },
  { label: "Footwear", href: "/footwear", emoji: "👟" },
  { label: "Merch", href: "/merch", emoji: "👕" },
];

export interface Module {
  key: string; title: string; blurb: string; emoji: string; href: string;
  accent: string; points: string[];
}
export const MODULES: Module[] = [
  { key: "market", title: "Skills Market", emoji: "🗺", href: "/market", accent: "#00e5ff",
    blurb: "An interactive map of 250+ service categories — from electricians and chefs to mama fuas and jua-kali artisans.",
    points: ["250+ categories", "Live bubble visualisation", "Search by area & skill"] },
  { key: "hire", title: "Hire a Pro", emoji: "👔", href: "/hire", accent: "#a78bfa",
    blurb: "Verified professional portfolios and storefronts. Compare ratings, packages and past work, then book instantly.",
    points: ["Rated portfolios", "Service packages", "Instant WhatsApp booking"] },
  { key: "rentals", title: "Rentals & Stays", emoji: "🏠", href: "/rentals", accent: "#00ffb3",
    blurb: "Bedsitters, apartments, shops and event spaces across Nairobi — with matatu-stage distance and honest deposits.",
    points: ["Nairobi-wide listings", "Matatu-stage distance", "Direct-to-landlord"] },
  { key: "footwear", title: "Footwear & Merch", emoji: "👟", href: "/footwear", accent: "#ff2d87",
    blurb: "Locally-made sneakers, sandals and branded merch. Size × colour variants, delivered anywhere in Kenya.",
    points: ["Size & colour variants", "Countrywide delivery", "M-Pesa checkout"] },
];

export interface Category { slug: string; name: string; icon: string; color: string; }
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
  { slug: "boda", name: "Boda & Delivery", icon: "🏍️", color: "#2b8fff" },
];

export const STATS = [
  { value: "250+", label: "Service categories" },
  { value: "2,800+", label: "Verified pros" },
  { value: "0%", label: "Agent fees" },
  { value: "M-Pesa", label: "Native checkout" },
];

export const TICKER = [
  "250 Service Categories", "Nairobi & Surrounding Areas", "WhatsApp-Native Orders",
  "M-Pesa Integrated", "0% Agent Fees", "Verified Professionals", "Rental Listings",
  "Footwear Catalog",
];

export const STEPS = [
  { n: "01", title: "Discover", accent: "#00e5ff",
    body: "Browse the live skills map or search by trade and neighbourhood. Every pro shows ratings, packages and real portfolio work." },
  { n: "02", title: "Order on WhatsApp", accent: "#00ffb3",
    body: "One tap builds a pre-formatted order message. No app to install, no account friction — chat is the checkout." },
  { n: "03", title: "Pay with M-Pesa", accent: "#f5a623",
    body: "Confirm and pay via M-Pesa STK Push. Funds are tracked, receipts are logged, and both sides get notified." },
];

export interface Pro {
  id: string; name: string; initials: string; title: string; categorySlug: string;
  category: string; area: string; rating: number; reviews: number; jobs: number;
  xp: number; priceFrom: number; accent: string; level: string; featured?: boolean;
}
export const PROS: Pro[] = [
  { id: "p1", name: "Wanjiku Mwangi", initials: "WM", title: "Mobile Braiding & Locs", categorySlug: "beauty", category: "Beauty", area: "Kasarani", rating: 4.9, reviews: 214, jobs: 132, xp: 6400, priceFrom: 800, accent: "#ff3d9a", level: "Master", featured: true },
  { id: "p2", name: "Otieno Ochieng", initials: "OO", title: "Certified Electrician", categorySlug: "construction", category: "Construction", area: "Embakasi", rating: 4.8, reviews: 176, jobs: 240, xp: 7200, priceFrom: 1500, accent: "#ff8c00", level: "Legend" },
  { id: "p3", name: "Amina Hassan", initials: "AH", title: "Private Chef & Caterer", categorySlug: "food", category: "Food & Catering", area: "Kilimani", rating: 5.0, reviews: 98, jobs: 84, xp: 4100, priceFrom: 2500, accent: "#ff6b2b", level: "Expert", featured: true },
  { id: "p4", name: "Brian Kiptoo", initials: "BK", title: "Phone & Laptop Repair", categorySlug: "tech", category: "Tech & Devices", area: "CBD", rating: 4.7, reviews: 321, jobs: 410, xp: 8200, priceFrom: 500, accent: "#00d4ff", level: "Legend" },
  { id: "p5", name: "Grace Njeri", initials: "GN", title: "Deep Cleaning Crew", categorySlug: "home", category: "Home Services", area: "Roysambu", rating: 4.8, reviews: 143, jobs: 187, xp: 5600, priceFrom: 2000, accent: "#7c5cff", level: "Master" },
  { id: "p6", name: "David Mutua", initials: "DM", title: "Plumber & Handyman", categorySlug: "construction", category: "Construction", area: "Rongai", rating: 4.6, reviews: 89, jobs: 154, xp: 4800, priceFrom: 1200, accent: "#ff8c00", level: "Expert" },
  { id: "p7", name: "Faith Wambui", initials: "FW", title: "Makeup Artist", categorySlug: "beauty", category: "Beauty", area: "Westlands", rating: 4.9, reviews: 205, jobs: 176, xp: 6100, priceFrom: 3000, accent: "#ff3d9a", level: "Master", featured: true },
  { id: "p8", name: "Samuel Kariuki", initials: "SK", title: "Events DJ & Sound", categorySlug: "events", category: "Events", area: "Thika Road", rating: 4.7, reviews: 67, jobs: 92, xp: 3900, priceFrom: 8000, accent: "#ffd000", level: "Expert" },
  { id: "p9", name: "Mercy Achieng", initials: "MA", title: "Math & Sciences Tutor", categorySlug: "education", category: "Education", area: "Lang'ata", rating: 5.0, reviews: 54, jobs: 63, xp: 3200, priceFrom: 1000, accent: "#00ffb3", level: "Expert" },
];
export const PRO_FILTERS = [
  { slug: "all", label: "All pros", color: "#00e5ff" },
  { slug: "beauty", label: "Beauty", color: "#ff3d9a" },
  { slug: "construction", label: "Construction", color: "#ff8c00" },
  { slug: "food", label: "Food", color: "#ff6b2b" },
  { slug: "tech", label: "Tech", color: "#00d4ff" },
  { slug: "home", label: "Home", color: "#7c5cff" },
  { slug: "events", label: "Events", color: "#ffd000" },
  { slug: "education", label: "Education", color: "#00ffb3" },
];

export interface Rental {
  id: string; title: string; type: string; typeLabel: string; area: string;
  price: number; deposit: number; beds: number; baths: number; furnished: boolean;
  matatuStage: string; matatuMins: number; amenities: string[]; accent: string;
}
export const RENTALS: Rental[] = [
  { id: "r1", title: "Cozy Bedsitter — Sunton", type: "bedsitter", typeLabel: "Bedsitter", area: "Kasarani", price: 9500, deposit: 9500, beds: 1, baths: 1, furnished: false, matatuStage: "Sunton", matatuMins: 5, amenities: ["Water 24/7", "Secure", "Parking"], accent: "#00e5ff" },
  { id: "r2", title: "Modern 1BR — Roysambu", type: "1br", typeLabel: "1 Bedroom", area: "Roysambu", price: 18000, deposit: 18000, beds: 1, baths: 1, furnished: false, matatuStage: "TRM", matatuMins: 8, amenities: ["Lift", "Balcony", "CCTV", "Borehole"], accent: "#00ffb3" },
  { id: "r3", title: "Furnished Studio — Kilimani", type: "furnished_apt", typeLabel: "Furnished", area: "Kilimani", price: 45000, deposit: 45000, beds: 1, baths: 1, furnished: true, matatuStage: "Yaya", matatuMins: 4, amenities: ["Furnished", "Wi-Fi", "Gym", "Pool"], accent: "#a78bfa" },
  { id: "r4", title: "Spacious 2BR — Embakasi", type: "2br", typeLabel: "2 Bedroom", area: "Embakasi", price: 26000, deposit: 26000, beds: 2, baths: 2, furnished: false, matatuStage: "Pipeline", matatuMins: 6, amenities: ["Master ensuite", "Parking", "Playground"], accent: "#ff6b2b" },
  { id: "r5", title: "Servant Quarter (SQ) — Rongai", type: "sq", typeLabel: "SQ", area: "Rongai", price: 12000, deposit: 12000, beds: 1, baths: 1, furnished: false, matatuStage: "Maasai Mall", matatuMins: 10, amenities: ["Private entrance", "Water tank"], accent: "#66bb6a" },
  { id: "r6", title: "Retail Shop — CBD", type: "shop", typeLabel: "Shop", area: "CBD", price: 35000, deposit: 70000, beds: 0, baths: 1, furnished: false, matatuStage: "Kencom", matatuMins: 2, amenities: ["Ground floor", "High footfall", "Backup power"], accent: "#f5a623" },
  { id: "r7", title: "Event Space — Karen", type: "event_space", typeLabel: "Event Space", area: "Karen", price: 80000, deposit: 40000, beds: 0, baths: 3, furnished: true, matatuStage: "Karen Shopping", matatuMins: 7, amenities: ["Garden", "Parking 40+", "Kitchen", "PA system"], accent: "#ff2d87" },
  { id: "r8", title: "Studio — Ngara", type: "studio", typeLabel: "Studio", area: "Ngara", price: 14000, deposit: 14000, beds: 1, baths: 1, furnished: false, matatuStage: "Ngara Stage", matatuMins: 3, amenities: ["Water 24/7", "Tiled", "Secure"], accent: "#00e5ff" },
];
export const RENTAL_TYPES = [
  { value: "all", label: "All" },
  { value: "bedsitter", label: "Bedsitter" },
  { value: "sq", label: "SQ" },
  { value: "studio", label: "Studio" },
  { value: "1br", label: "1BR" },
  { value: "2br", label: "2BR" },
  { value: "furnished_apt", label: "Furnished" },
  { value: "shop", label: "Shop" },
  { value: "event_space", label: "Event Space" },
];

export interface ProductColor { name: string; hex: string; }
export interface Product {
  id: string; name: string; category: string; kind: "footwear" | "merch";
  price: number; wasPrice?: number; sold: number; rating: number;
  sizes: string[]; colors: ProductColor[]; accent: string; badge?: string;
  selSize?: string; selColor?: ProductColor;
}
export const PRODUCTS: Product[] = [
  { id: "s1", name: "Canvas Low-Top — Nairobi Edition", category: "Sneakers", kind: "footwear", price: 2999, wasPrice: 3999, sold: 340, rating: 4.8, sizes: ["39", "40", "41", "42", "43"], colors: [{ name: "Black", hex: "#111" }, { name: "White", hex: "#eee" }, { name: "Olive", hex: "#5b6b3a" }], accent: "#ff2d87", badge: "Bestseller" },
  { id: "s2", name: "Leather Sandals — Jua Kali", category: "Sandals", kind: "footwear", price: 1899, sold: 210, rating: 4.7, sizes: ["40", "41", "42", "43", "44"], colors: [{ name: "Tan", hex: "#b5793f" }, { name: "Brown", hex: "#5a3921" }], accent: "#ff6b2b" },
  { id: "s3", name: "Running Trainers — Mara", category: "Sneakers", kind: "footwear", price: 4499, wasPrice: 5500, sold: 156, rating: 4.9, sizes: ["40", "41", "42", "43"], colors: [{ name: "Volt", hex: "#c8ff00" }, { name: "Ink", hex: "#0e1022" }], accent: "#00ffb3", badge: "New" },
  { id: "s4", name: "High-Top Canvas — Safari", category: "Sneakers", kind: "footwear", price: 3299, sold: 128, rating: 4.6, sizes: ["39", "40", "41", "42"], colors: [{ name: "Cream", hex: "#efe7d3" }, { name: "Navy", hex: "#1b2a4a" }], accent: "#00e5ff" },
  { id: "m1", name: "\"Wear Your Hustle\" Tee", category: "T-Shirts", kind: "merch", price: 1499, sold: 512, rating: 4.9, sizes: ["S", "M", "L", "XL", "XXL"], colors: [{ name: "Black", hex: "#111" }, { name: "White", hex: "#eee" }, { name: "Cyan", hex: "#00e5ff" }], accent: "#c8ff00", badge: "Bestseller" },
  { id: "m2", name: "KaziHub Snapback Cap", category: "Caps", kind: "merch", price: 1299, sold: 288, rating: 4.7, sizes: ["One size"], colors: [{ name: "Black", hex: "#111" }, { name: "Khaki", hex: "#b3a179" }], accent: "#f5a623" },
  { id: "m3", name: "Fundi Work Hoodie", category: "Hoodies", kind: "merch", price: 2999, wasPrice: 3499, sold: 174, rating: 4.8, sizes: ["S", "M", "L", "XL"], colors: [{ name: "Charcoal", hex: "#2a2a2a" }, { name: "Green", hex: "#00ffb3" }], accent: "#a78bfa", badge: "New" },
  { id: "m4", name: "Nairobi Tote Bag", category: "Bags", kind: "merch", price: 899, sold: 401, rating: 4.6, sizes: ["One size"], colors: [{ name: "Natural", hex: "#d8c7a8" }, { name: "Black", hex: "#111" }], accent: "#ff2d87" },
];

export interface BubbleDatum {
  category_id: number; slug: string; name: string; icon: string | null;
  color: string | null; listings: number; workers: number; jobs_done: number; xp: number;
}

export function priceKES(n: number): string {
  return "KES " + n.toLocaleString("en-KE");
}
