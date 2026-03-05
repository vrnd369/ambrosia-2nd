/**
 * Lightweight in-memory rate limiter.
 * Protects backend from traffic spikes.
 * Max 60 req/min, 1000 req/hour per IP.
 */

const requests = new Map();
const MINUTE_LIMIT = 60;
const HOUR_LIMIT = 1000;

function getClientKey(req) {
  return req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

function cleanup() {
  const now = Date.now();
  for (const [ip, data] of requests.entries()) {
    if (now - data.lastMinute > 60_000 && now - data.lastHour > 3_600_000) {
      requests.delete(ip);
    }
  }
}

setInterval(cleanup, 60_000);

export function rateLimit(req, res, next) {
  if (req.path === '/api/health') return next();
  const ip = getClientKey(req);
  const now = Date.now();

  if (!requests.has(ip)) {
    requests.set(ip, {
      minuteCount: 0,
      hourCount: 0,
      lastMinute: now,
      lastHour: now,
    });
  }

  const data = requests.get(ip);

  if (now - data.lastMinute > 60_000) {
    data.minuteCount = 0;
    data.lastMinute = now;
  }
  if (now - data.lastHour > 3_600_000) {
    data.hourCount = 0;
    data.lastHour = now;
  }

  data.minuteCount++;
  data.hourCount++;

  if (data.minuteCount > MINUTE_LIMIT || data.hourCount > HOUR_LIMIT) {
    res.status(429).json({ error: 'Too Many Requests', retryAfter: 60 });
    return;
  }

  next();
}
