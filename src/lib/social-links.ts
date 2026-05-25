/** Official Future Star championship social profiles. */

export const SOCIAL_LINKS = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/futurestar.championship",
    handle: "@futurestar.championship",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/futurestar.championship",
    handle: "futurestar.championship",
  },
] as const;

export type SocialLinkId = (typeof SOCIAL_LINKS)[number]["id"];
