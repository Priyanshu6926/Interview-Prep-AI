/**
 * In-process LRU question cache powered by node-cache.
 *
 * Caches generated question sets keyed by a stable hash of
 * role + experience + focusAreas. TTL: 1 hour. Max 200 entries.
 *
 * IMPORTANT: Resume-based sessions are NEVER cached because their
 * questions are personalized to a specific candidate's resume content.
 */

import crypto from "crypto";
import NodeCache from "node-cache";

// 1 hour TTL, check for stale entries every 2 minutes
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120, maxKeys: 200 });

/**
 * Build a stable, deterministic cache key from session parameters.
 * Focus areas are sorted so order doesn't matter.
 */
export function buildCacheKey({ role, experience, focusAreas = [] }) {
  const normalized = `${String(role).toLowerCase().trim()}|${Number(experience)}|${[...focusAreas]
    .map((a) => a.toLowerCase().trim())
    .sort()
    .join(",")}`;
  return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 24);
}

/** Returns cached questions or undefined on a miss. */
export function getCachedQuestions(key) {
  const value = cache.get(key);
  if (value !== undefined) {
    console.log(`[QuestionCache] HIT  key=${key} entries=${cache.getStats().keys}`);
  }
  return value;
}

/** Stores questions in the cache. Deep-clones to avoid reference mutation. */
export function setCachedQuestions(key, questions) {
  const cloned = JSON.parse(JSON.stringify(questions));
  cache.set(key, cloned);
  console.log(`[QuestionCache] SET  key=${key} count=${questions.length}`);
}

/** Returns current cache stats for health monitoring. */
export function getCacheStats() {
  return cache.getStats();
}
