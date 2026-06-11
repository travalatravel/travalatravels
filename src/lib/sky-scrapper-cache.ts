type CacheEntry<T> = { value: T; expiresAt: number };

const searchCache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

const SEARCH_TTL_MS = 30 * 60 * 1000;
const AIRPORT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function read<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
  const hit = map.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    map.delete(key);
    return null;
  }
  return hit.value;
}

function write<T>(map: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs: number) {
  map.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function getCachedSearch<T>(key: string): T | null {
  return read(searchCache, key) as T | null;
}

export function setCachedSearch<T>(key: string, value: T) {
  write(searchCache, key, value, SEARCH_TTL_MS);
}

export function getStaleSearch<T>(key: string): T | null {
  const hit = searchCache.get(key);
  if (!hit) return null;
  const value = hit.value as T;
  const hasData = Array.isArray(value) ? value.length > 0 : value != null;
  return hasData ? value : null;
}

export async function dedupeSearch<T>(key: string, run: () => Promise<T>): Promise<T> {
  const cached = getCachedSearch<T>(key);
  if (cached) return cached;

  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const promise = run()
    .then((value) => {
      const hasData = Array.isArray(value) ? value.length > 0 : value != null;
      if (hasData) setCachedSearch(key, value);
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
}

const airportCache = new Map<string, CacheEntry<{ skyId: string; entityId: string }>>();

export function getCachedAirport(key: string) {
  return read(airportCache, key);
}

export function setCachedAirport(key: string, ref: { skyId: string; entityId: string }) {
  write(airportCache, key, ref, AIRPORT_TTL_MS);
}
