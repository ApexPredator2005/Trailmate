/**
 * cache.js — In-Memory TTL Cache Service
 *
 * Provides thread-safe, fast in-memory caching with per-key expiration.
 * Used for flight searches, place searches, and weather queries to minimize external API costs.
 */

class MemoryCache {
  constructor() {
    /** @type {Map<string, { value: any, expiresAt: number }>} */
    this._store = new Map();
  }

  /**
   * Store a value with a Time-To-Live (in milliseconds).
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlMs=300000] - Default 5 minutes (300,000 ms)
   */
  set(key, value, ttlMs = 300000) {
    const expiresAt = Date.now() + ttlMs;
    this._store.set(key, { value, expiresAt });
  }

  /**
   * Retrieve a value if it exists and has not expired.
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const item = this._store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this._store.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Check if a valid, non-expired key exists.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from the cache.
   * @param {string} key
   */
  del(key) {
    this._store.delete(key);
  }

  /**
   * Clear all items in the cache.
   */
  clear() {
    this._store.clear();
  }

  /**
   * Clean up expired keys to prevent memory leaks.
   */
  prune() {
    const now = Date.now();
    for (const [key, item] of this._store.entries()) {
      if (now > item.expiresAt) {
        this._store.delete(key);
      }
    }
  }
}

export const cache = new MemoryCache();
