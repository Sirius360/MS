// ===== server/config/memoryCache.js =====
// In-memory cache implementation (fallback when Redis not available)

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 1000; // Limit cache size to prevent memory issues
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
    
    console.log('✅ Memory cache initialized');
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 1 hour)
   */
  set(key, value, ttlSeconds = 3600) {
    // Enforce cache size limit (LRU-style)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete specific key
   * @param {string} key - Cache key to delete
   */
  del(key) {
    this.cache.delete(key);
  }

  /**
   * Delete keys matching pattern
   * @param {string} pattern - Pattern with * wildcard (e.g., "products:*")
   */
  delPattern(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  flush() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let totalSize = 0;
    let expiredCount = 0;
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      totalSize += JSON.stringify(item.value).length;
      if (now > item.expiry) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expiredCount,
      totalSizeKB: (totalSize / 1024).toFixed(2),
    };
  }

  /**
   * Get or set pattern (cache-aside)
   * @param {string} key - Cache key
   * @param {Function} fetcher - Async function to fetch data if not cached
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} Cached or fetched value
   */
  async getOrSet(key, fetcher, ttl = 3600) {
    // Try to get from cache
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const data = await fetcher();

    // Store in cache
    this.set(key, data, ttl);

    return data;
  }

  /**
   * Clean up expired entries
   * @private
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }
  }
}

// Export singleton instance
export const cache = new MemoryCache();
export default cache;
