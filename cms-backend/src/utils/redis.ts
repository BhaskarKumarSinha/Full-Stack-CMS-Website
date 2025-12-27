// src/utils/redis.ts
import Redis from "ioredis";
import config from "../config";
import logger from "../utils/logger";

let client: Redis | null = null;
let redisConnected = false;

const memoryCache = new Map<string, string>();

/**
 * Try to initialize Redis client if REDIS_URL provided.
 * If connection fails, we fall back to memory cache silently.
 */
function initRedis() {
  if (!config.REDIS_URL) {
    logger.info("REDIS_URL not set — using in-memory cache");
    return;
  }

  try {
    const c = new Redis(config.REDIS_URL, {
      // prevent too-aggressive reconnection spam, tune as needed
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        // no reconnection if first connect fails (fallback to memory)
        if (times > 1) return null;
        // small backoff otherwise
        return Math.min(times * 50, 200);
      },
    });

    c.once("ready", () => {
      redisConnected = true;
      client = c;
      logger.info("Connected to Redis");
    });

    c.once("error", (err: any) => {
      // handle initial connection failure gracefully
      logger.warn(
        "Redis connection error (falling back to memory cache): %s",
        err.message ?? err
      );
      try {
        c.disconnect();
      } catch (_) {}
      client = null;
      redisConnected = false;
    });

    // If connection never becomes 'ready' within a short window, we'll fallback.
    // This avoids long-running connect attempts on startup.
    setTimeout(() => {
      if (!redisConnected) {
        if (client) {
          try {
            client.disconnect();
          } catch (_) {}
        }
        client = null;
        logger.info("Redis not ready — using in-memory cache");
      }
    }, 3000); // 3s startup window
  } catch (err: any) {
    logger.warn(
      "Failed to initialize Redis client — using in-memory cache: %s",
      err.message ?? err
    );
    client = null;
    redisConnected = false;
  }
}

// Only initialize Redis client outside of test environment to avoid
// creating background connections/handles during Jest runs.
if (config.NODE_ENV !== "test") {
  initRedis();
}

export default {
  async get(key: string): Promise<string | null> {
    if (client && redisConnected) {
      try {
        const v = await client.get(key);
        return v;
      } catch (err) {
        logger.warn(
          "Redis get failed, falling back to memory: %s",
          (err as any).message ?? err
        );
        redisConnected = false;
        try {
          client.disconnect();
        } catch (_) {}
        client = null;
        return memoryCache.get(key) ?? null;
      }
    }
    return memoryCache.get(key) ?? null;
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (client && redisConnected) {
      try {
        if (ttlSeconds) await client.set(key, value, "EX", ttlSeconds);
        else await client.set(key, value);
        return;
      } catch (err) {
        logger.warn(
          "Redis set failed, falling back to memory: %s",
          (err as any).message ?? err
        );
        redisConnected = false;
        try {
          client.disconnect();
        } catch (_) {}
        client = null;
        memoryCache.set(key, value);
        if (ttlSeconds && config.NODE_ENV !== "test")
          setTimeout(() => memoryCache.delete(key), ttlSeconds * 1000);
        return;
      }
    }
    memoryCache.set(key, value);
    if (ttlSeconds && config.NODE_ENV !== "test")
      setTimeout(() => memoryCache.delete(key), ttlSeconds * 1000);
  },

  async del(key: string): Promise<void> {
    if (client && redisConnected) {
      try {
        await client.del(key);
        return;
      } catch (err) {
        logger.warn(
          "Redis del failed, falling back to memory delete: %s",
          (err as any).message ?? err
        );
        redisConnected = false;
        try {
          client.disconnect();
        } catch (_) {}
        client = null;
        memoryCache.delete(key);
        return;
      }
    }
    memoryCache.delete(key);
  },
};
