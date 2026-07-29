// Thin client for the KaziHub FastAPI backend.
// In the browser, calls go to /api/* and Next rewrites them to the API host.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export type Page<T> = { items: T[]; total: number; page: number; size: number };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export interface BubbleDatum {
  category_id: number;
  slug: string;
  name: string;
  icon: string | null;
  color: string | null;
  listings: number;
  workers: number;
  jobs_done: number;
  xp: number;
}

export const api = {
  bubbleData: () => request<BubbleDatum[]>("/api/v1/services/bubble-data"),
  categories: () => request<unknown[]>("/api/v1/services/categories"),
};
