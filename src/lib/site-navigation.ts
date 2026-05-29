/** Public site navigation — shared by header, mobile drawer, and footer. */

export type SiteNavItem = {
  href: string;
  label: string;
  exact?: boolean;
  highlight?: boolean;
};

export const SITE_PRIMARY_NAV: SiteNavItem[] = [
  { href: "/", label: "Home", exact: true },
  { href: "/about", label: "About" },
  { href: "/sponsorship", label: "Partners" },
  { href: "/teams", label: "Teams" },
  { href: "/schedule", label: "Schedule" },
  { href: "/trials", label: "Trial zones" },
  { href: "/blog", label: "Blog" },
  { href: "/register", label: "Join", highlight: true },
];

export const SITE_FOOTER_EXPLORE: SiteNavItem[] = [
  { href: "/about", label: "About the league" },
  { href: "/blog", label: "News & updates" },
  { href: "/sponsorship", label: "Sponsorship & partners" },
  { href: "/trials", label: "Trial zones" },
  { href: "/register", label: "Trial registration" },
];

export const SITE_FOOTER_LEGAL: SiteNavItem[] = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms & conditions" },
  { href: "/contact", label: "Contact us" },
];
