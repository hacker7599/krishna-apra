/**
 * Legal & entity details shown in the site footer and legal pages.
 * Override registered address in production via LEGAL_REGISTERED_ADDRESS in .env.
 */
const DEFAULT_REGISTERED_ADDRESS = "TBCL SPORTS PRIVATE LIMITED, Delhi NCR, India";

export const LEGAL_ENTITY = {
  tradeName: "Future Star U-15 Championship",
  legalName: "TBCL SPORTS PRIVATE LIMITED",
  registeredAddress:
    process.env.LEGAL_REGISTERED_ADDRESS?.trim() || DEFAULT_REGISTERED_ADDRESS,
  contactEmail: "info@futurestarchampion.com",
  grievanceEmail: "grievance@futurestarchampion.com",
  website: "https://futurestarchampion.com",
} as const;

export const COPYRIGHT_HOLDER = LEGAL_ENTITY.legalName;
