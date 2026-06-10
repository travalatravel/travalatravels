import type { LivePriceResult } from "@/lib/travala-price";

const CACHE_TTL_MS = 1000 * 60 * 10;

type Entry = { data: LivePriceResult; at: number };

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<LivePriceResult | null>>();

export function livePriceCacheKey(input: {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}): string {
  return `${input.slug}:${input.checkIn}:${input.checkOut}:${input.guests}:${input.rooms}`;
}

export function getCachedLivePrice(key: string): LivePriceResult | null {
  const hit = cache.get(key);
  if (!hit || Date.now() - hit.at > CACHE_TTL_MS) return null;
  return hit.data;
}

export function setCachedLivePrice(key: string, data: LivePriceResult) {
  cache.set(key, { data, at: Date.now() });
}

export function getInflightLivePrice(key: string): Promise<LivePriceResult | null> | undefined {
  return inflight.get(key);
}

export function setInflightLivePrice(key: string, promise: Promise<LivePriceResult | null>) {
  inflight.set(key, promise);
  void promise.finally(() => {
    if (inflight.get(key) === promise) inflight.delete(key);
  });
}
