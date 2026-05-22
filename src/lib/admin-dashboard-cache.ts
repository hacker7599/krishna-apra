"use client";

const CACHE_MS = 45_000;

type DashboardStats = Record<string, unknown>;

let cache: { data: DashboardStats; at: number } | null = null;
let inflight: Promise<DashboardStats | null> | null = null;

export function getCachedDashboard(): DashboardStats | null {
  if (!cache) return null;
  if (Date.now() - cache.at > CACHE_MS) return null;
  return cache.data;
}

export function setCachedDashboard(data: DashboardStats) {
  cache = { data, at: Date.now() };
}

export async function fetchDashboardCached(
  fetcher: () => Promise<Response>,
): Promise<DashboardStats | null> {
  const hit = getCachedDashboard();
  if (hit) return hit;

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetcher();
      if (!res.ok) return null;
      const data = (await res.json()) as DashboardStats;
      setCachedDashboard(data);
      return data;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function invalidateDashboardCache() {
  cache = null;
}
