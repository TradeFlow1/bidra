type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

export function rateLimitResult(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now >= b.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, limit, remaining: Math.max(0, limit - 1), resetAt, retryAfterSeconds: 0 };
  }

  if (b.count >= limit) {
    return {
      ok: false,
      limit,
      remaining: 0,
      resetAt: b.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
    };
  }

  b.count += 1;
  buckets.set(key, b);

  return {
    ok: true,
    limit,
    remaining: Math.max(0, limit - b.count),
    resetAt: b.resetAt,
    retryAfterSeconds: 0,
  };
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  return rateLimitResult(key, limit, windowMs).ok;
}

export function clientIpFromHeaders(headers: Headers | Record<string, string | string[] | undefined> | null | undefined): string {
  const getHeader = function (name: string): string {
    const anyHeaders = headers as any;
    if (!anyHeaders) return "";
    if (typeof anyHeaders.get === "function") return String(anyHeaders.get(name) || "");
    const direct = anyHeaders[name] || anyHeaders[name.toLowerCase()] || anyHeaders[name.toUpperCase()];
    if (Array.isArray(direct)) return String(direct[0] || "");
    return String(direct || "");
  };

  const forwarded = getHeader("x-forwarded-for").split(",")[0]?.trim();
  const real = getHeader("x-real-ip").trim();
  return forwarded || real || "unknown";
}

export function tooManyRequestsJson(message: string, retryAfterSeconds: number) {
  return {
    ok: false,
    error: message,
    status: 429,
    headers: {
      "Retry-After": String(Math.max(1, retryAfterSeconds)),
    },
  };
}
