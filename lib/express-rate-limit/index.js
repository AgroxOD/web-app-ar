export default function rateLimit(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max ?? options.limit ?? 5; // default max if not given
  const cleanupIntervalMs = options.cleanupIntervalMs || 60 * 1000;
  const store = new Map();

  function cleanup() {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.expires <= now) store.delete(key);
    }
  }

  const interval = setInterval(cleanup, cleanupIntervalMs);
  if (interval.unref) interval.unref();

  function limiter(req, res, next) {
    const key = req.ip || req.headers['x-forwarded-for'] || 'default';
    const now = Date.now();
    let entry = store.get(key);
    if (!entry || entry.expires <= now) {
      entry = { count: 1, expires: now + windowMs };
      store.set(key, entry);
    } else {
      entry.count += 1;
    }
    if (entry.count > max) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }
    next();
  }

  limiter.stop = () => clearInterval(interval);
  limiter._store = store; // exposed for tests

  return limiter;
}
