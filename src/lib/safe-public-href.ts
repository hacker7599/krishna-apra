/**
 * Hardening for user-controlled links shown on the public site (e.g. hero CTA).
 * Blocks javascript:, data:, protocol-relative //evil.com, and odd whitespace / quotes.
 */

const BLOCKED_PREFIX = /^(javascript|data|vbscript|file|about):/i;

export function isSafeBannerCtaHref(href: string): boolean {
  const t = href.trim();
  if (!t) return true;
  if (BLOCKED_PREFIX.test(t)) return false;
  if (/\s|[<>\\]|["'`]/.test(t)) return false;
  if (t.startsWith("//")) return false;
  if (t.startsWith("/")) {
    return true;
  }
  try {
    const u = new URL(t);
    const proto = u.protocol.toLowerCase();
    if (proto === "https:") {
      return u.hostname.length > 0;
    }
    if (proto === "http:") {
      const h = u.hostname.toLowerCase();
      return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
    }
    return false;
  } catch {
    return false;
  }
}

/** Strips unsafe stored values so the homepage never renders a dangerous href. */
export function sanitizeBannerCtaHrefForPublic(href: string | null): string | null {
  if (href == null) return null;
  const t = href.trim();
  if (!t) return null;
  return isSafeBannerCtaHref(t) ? t : null;
}

/** Google Maps / short links only (https), or http on localhost for dev. */
export function isSafeGoogleMapsUrl(url: string): boolean {
  const t = url.trim();
  if (!t || BLOCKED_PREFIX.test(t)) return false;
  if (/\s|[<>\\]|["'`]/.test(t)) return false;
  if (t.startsWith("//")) return false;
  try {
    const u = new URL(t);
    const proto = u.protocol.toLowerCase();
    if (proto === "http:") {
      const h = u.hostname.toLowerCase();
      return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
    }
    if (proto !== "https:") return false;
    const h = u.hostname.toLowerCase();
    if (h === "goo.gl" || h === "g.co" || h === "maps.app.goo.gl") return true;
    if (h === "google.com" || h === "www.google.com" || h === "maps.google.com") return true;
    if (h.endsWith(".google.com")) return true;
    return false;
  } catch {
    return false;
  }
}

export function sanitizeTrialZoneNavUrl(url: string | null): string | null {
  if (url == null) return null;
  const t = url.trim();
  if (!t) return null;
  return isSafeGoogleMapsUrl(t) ? t : null;
}
