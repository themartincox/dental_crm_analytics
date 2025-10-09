// Optional distributed rate limiting with Redis, with safe in-memory fallback.
// Enable via env: ENABLE_REDIS_RATELIMIT=1 and set REDIS_URL.

module.exports = function createRateLimiter(options = {}) {
  const windowSeconds = options.windowSeconds || 15 * 60; // 15 minutes
  const points = options.points || 300; // requests per window

  const enabled = process.env.ENABLE_REDIS_RATELIMIT === '1' && !!process.env.REDIS_URL;
  // Simple in-memory fallback (per-process)
  const map = new Map();
  const fallback = (req, res, next) => {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const key = req.user?.id ? `u:${req.user.id}` : `ip:${req.ip || req.connection?.remoteAddress || 'unknown'}`;
    const entry = map.get(key) || { count: 0, start: now };
    if (now - entry.start > windowMs) {
      entry.count = 0; entry.start = now;
    }
    entry.count += 1;
    map.set(key, entry);
    if (entry.count > points) {
      res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({ error: 'Too many requests' });
    }
    next();
  };

  if (enabled) {
    try {
      const { RateLimiterRedis } = require('rate-limiter-flexible');
      const Redis = require('ioredis');
      const redis = new Redis(process.env.REDIS_URL, { enableOfflineQueue: false });
      const limiter = new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl',
        points,
        duration: windowSeconds,
        blockDuration: windowSeconds,
      });

      let useFallback = false;
      return async (req, res, next) => {
        if (useFallback) return fallback(req, res, next);
        try {
          const key = req.user?.id ? `u:${req.user.id}` : `ip:${req.ip}`;
          await limiter.consume(key);
          next();
        } catch (rlRes) {
          // If Redis is unavailable, permanently fall back for this process
          if (rlRes && (rlRes.code === 'ECONNREFUSED' || rlRes.message?.includes('redis') || rlRes.message?.includes('connect'))) {
            useFallback = true;
            return fallback(req, res, next);
          }
          if (rlRes?.msBeforeNext) {
            res.set('Retry-After', String(Math.ceil(rlRes.msBeforeNext / 1000)));
          }
          res.status(429).json({ error: 'Too many requests' });
        }
      };
    } catch (e) {
      // fall through to in-memory fallback if deps are not installed
    }
  }

  return fallback;
};
