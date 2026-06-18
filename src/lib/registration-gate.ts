import type { HeroBannerDTO } from "@/components/hero-banners-carousel";

/**
 * Master switch for public trial registration.
 * Set NEXT_PUBLIC_REGISTRATION_OPEN=true in env to reopen without a code change.
 */
export const REGISTRATION_OPEN = process.env.NEXT_PUBLIC_REGISTRATION_OPEN === "true";

export const REGISTRATION_CLOSED_HEADLINE = "Registration closed";

export const REGISTRATION_CLOSED_LEAD =
  "Trial registration for Future Star U-15 Season 1 has closed. Thank you for your interest — follow the schedule and trial zones for updates.";

export const REGISTRATION_CLOSED_MESSAGE =
  "Trial registration is closed for Season 1. Please contact the league desk if you need help with an existing application.";

export const REGISTRATION_CLOSED_CTA_LABEL = "Registration closed";

export const REGISTRATION_CLOSED_ANNOUNCEMENT =
  "Registration closed for Season 1 trials — check schedule and trial zones for updates.";

export function isRegistrationOpen(): boolean {
  return REGISTRATION_OPEN;
}

export function isRegisterPath(href: string | null | undefined): boolean {
  if (!href) return false;
  const path = href.trim().split(/[?#]/)[0] ?? "";
  return path === "/register" || path.startsWith("/register/");
}

/** Homepage hero slides: swap register CTAs when registration is closed. */
export function mapBannersForRegistrationStatus(banners: HeroBannerDTO[]): HeroBannerDTO[] {
  if (isRegistrationOpen()) return banners;

  return banners.map((banner) => {
    if (!isRegisterPath(banner.ctaHref)) return banner;

    const subtitle =
      banner.subtitle && /trials?\s+open|register/i.test(banner.subtitle)
        ? REGISTRATION_CLOSED_ANNOUNCEMENT
        : banner.subtitle;

    return {
      ...banner,
      subtitle,
      ctaLabel: REGISTRATION_CLOSED_CTA_LABEL,
      ctaHref: "/register",
    };
  });
}
