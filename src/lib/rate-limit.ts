interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const windowMs = 10 * 60 * 1000; // 10 minutes
const ipRecords = new Map<string, RateLimitRecord>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetMs: number } {
  const maxAllowed = parseInt(process.env.RATE_LIMIT_PER_10MIN || "40", 10) || 40;
  const now = Date.now();

  // Periodic cleanup of expired entries
  if (ipRecords.size > 1000) {
    for (const [key, record] of ipRecords.entries()) {
      if (record.resetAt <= now) {
        ipRecords.delete(key);
      }
    }
  }

  const existing = ipRecords.get(ip);

  if (!existing || existing.resetAt <= now) {
    ipRecords.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxAllowed - 1,
      resetMs: windowMs,
    };
  }

  if (existing.count >= maxAllowed) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count++;
  return {
    allowed: true,
    remaining: maxAllowed - existing.count,
    resetMs: Math.max(0, existing.resetAt - now),
  };
}
