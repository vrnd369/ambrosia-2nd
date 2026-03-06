/**
 * Request coalescing: prevents multiple identical queries from firing simultaneously.
 * When several components request the same data, only one DB request is executed.
 */
const requestCache = new Map();

export async function fetchWithCoalescing(key, fetchFn) {
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }

  const promise = Promise.resolve(fetchFn()).finally(() => requestCache.delete(key));

  requestCache.set(key, promise);
  return promise;
}

/**
 * Client-side short-term cache for API responses.
 * TTL: 60 seconds (configurable).
 */
const cache = new Map();
const DEFAULT_TTL_MS = 60_000;

export function getCachedData(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > DEFAULT_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCachedData(key, data, ttlMs = DEFAULT_TTL_MS) {
  cache.set(key, { data, timestamp: Date.now(), ttlMs });
}

export function invalidateCache(keyOrPattern) {
  if (!keyOrPattern) {
    cache.clear();
    return;
  }
  if (typeof keyOrPattern === 'string' && !keyOrPattern.includes('*')) {
    cache.delete(keyOrPattern);
    return;
  }
  const pattern = keyOrPattern.replace(/\*/g, '.*');
  const re = new RegExp(`^${pattern}$`);
  for (const k of cache.keys()) {
    if (re.test(k)) cache.delete(k);
  }
}

/** Notify all consumers that products have changed (Product/Shipping Management). Main site will refetch. */
export const PRODUCTS_UPDATED_EVENT = 'products-updated';
export function notifyProductsUpdated() {
  invalidateCache('products_list');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT));
  }
}
