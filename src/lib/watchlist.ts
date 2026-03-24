const STORAGE_KEY = "outbreak-context-watchlist";
const MAX_WATCHLIST = 5;

export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToWatchlist(iso3: string): string[] {
  const list = getWatchlist();
  if (list.includes(iso3) || list.length >= MAX_WATCHLIST) return list;
  const updated = [...list, iso3];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFromWatchlist(iso3: string): string[] {
  const list = getWatchlist().filter((c) => c !== iso3);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

export function isWatched(iso3: string): boolean {
  return getWatchlist().includes(iso3);
}

export function isWatchlistFull(): boolean {
  return getWatchlist().length >= MAX_WATCHLIST;
}
