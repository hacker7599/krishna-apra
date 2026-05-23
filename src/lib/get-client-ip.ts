import type { NextRequest } from "next/server";

/**
 * Client IP for rate limiting.
 * Production: set TRUST_PROXY_HEADERS=true behind Vercel/nginx so the edge IP is used (not spoofable XFF).
 * Development: falls back to first X-Forwarded-For for local testing.
 */
export function getClientIp(req: NextRequest) {
  const trustProxy = process.env.TRUST_PROXY_HEADERS === "true";

  if (trustProxy) {
    const real = req.headers.get("x-real-ip")?.trim();
    if (real) return real;
    const xf = req.headers.get("x-forwarded-for");
    if (xf) {
      const hops = xf.split(",").map((s) => s.trim()).filter(Boolean);
      if (hops.length > 0) return hops[hops.length - 1]!;
    }
    return "unknown";
  }

  if (process.env.NODE_ENV !== "production") {
    const xf = req.headers.get("x-forwarded-for");
    if (xf) return xf.split(",")[0]?.trim() || "unknown";
  }

  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
