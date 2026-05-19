import type { NextRequest } from "next/server";

/** Use for session cookies behind Nginx/Certbot (X-Forwarded-Proto). */
export function requestIsHttps(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const forwarded = req.headers.get("x-forwarded-proto");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim().toLowerCase() === "https";
  }
  return req.nextUrl.protocol === "https:";
}

export function adminCookieSecure(req: NextRequest): boolean {
  if (process.env.ADMIN_COOKIE_SECURE === "false") return false;
  if (process.env.ADMIN_COOKIE_SECURE === "true") return true;
  return requestIsHttps(req);
}
