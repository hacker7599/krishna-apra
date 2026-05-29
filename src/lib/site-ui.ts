/** Shared layout & UI tokens — keep in sync with globals.css + site.css. */

export const SITE_CONTAINER = "site-container";
export const SITE_CONTAINER_NARROW = "site-container site-container-narrow";
export const SITE_CONTAINER_CONTENT = "site-container site-container-content";

export const SECTION = "site-section";
export const SECTION_WHITE = "site-section site-section--white";
export const SECTION_MUTED = "site-section site-section--muted";
export const SECTION_ACCENT = "site-section site-section--accent";

/** @deprecated Use site-section spacing via SiteSection */
export const SECTION_PY = "py-14 sm:py-16 lg:py-20";

export const EYEBROW = "eyebrow";
export const PAGE_TITLE = "heading-page";
export const PAGE_LEAD = "lead";
export const SECTION_TITLE = "heading-section";
export const DISPLAY_TITLE = "heading-display";

export const BTN_PRIMARY =
  "site-btn site-btn--primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";
export const BTN_SECONDARY =
  "site-btn site-btn--secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400";
export const BTN_PRIMARY_SM = `${BTN_PRIMARY} site-btn--sm`;
export const BTN_SECONDARY_SM = `${BTN_SECONDARY} site-btn--sm`;

export const CARD = "site-card site-card--hover";
export const CARD_PAD = "site-card site-card--pad site-card--hover";
export const EMPTY_STATE = "site-empty";

export const STICKY_OFFSET = "scroll-mt-[4.5rem] sm:scroll-mt-20";
