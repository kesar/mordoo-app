/**
 * In-memory sliding window rate limiter.
 *
 * On Vercel serverless, instances are ephemeral but often reused (warm starts).
 * This provides effective protection against rapid-fire abuse within a warm
 * instance. Combined with the existing daily quota system, it covers both
 * burst abuse and daily limits.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean stale entries to prevent memory growth
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

/**
 * Check if a request should be rate-limited.
 *
 * @param key       Unique identifier (e.g., user ID)
 * @param maxHits   Max requests allowed in the window
 * @param windowMs  Window size in milliseconds
 * @returns `{ limited: false }` or `{ limited: true, retryAfterMs }`
 */
export function checkRateLimit(
  key: string,
  maxHits: number,
  windowMs: number,
): { limited: false } | { limited: true; retryAfterMs: number } {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Drop expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxHits) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    return { limited: true, retryAfterMs: Math.max(retryAfterMs, 1000) };
  }

  entry.timestamps.push(now);
  return { limited: false };
}
