/**
 * Outer Delhi Warriors — homepage initiative block.
 * Add uniform photos under `public/home/odw/` and set `portraitSrc` paths.
 */
export type OdwTeamMember = {
  id: string;
  name: string;
  role: string;
  portraitSrc: string;
  /** Path hint shown on empty slot */
  suggestedPath: string;
};

export const OUTER_DELHI_WARRIORS = {
  name: "Outer Delhi Warriors",
  tagline: "DPL franchise · Future Star U-15 initiative partner",
  whoTheyAre:
    "Outer Delhi Warriors are a Delhi Premier League (DPL) franchise built around competitive cricket, community pride, and professional match-day standards. From grassroots academies to franchise identity, they represent Outer Delhi on the big stage.",
  howTheySupport:
    "As the driving franchise behind Future Star U-15 Season 1, Outer Delhi Warriors provide league infrastructure, operational leadership, trial pathways, and the vision to give school-age cricketers a broadcast-ready, franchise-style tournament — backed by title sponsor Krishna Apra and partners across Delhi NCR.",
} as const;

/** Set portraitSrc to e.g. "/home/odw/priyansh.jpg" after adding files under public/home/odw/ */
export const ODW_TEAM_IN_UNIFORM: OdwTeamMember[] = [
  { id: "mohit-panwar", name: "Mohit Panwar", role: "Outer Delhi Warriors", portraitSrc: "/home/odw/mohit-panwar.jpg", suggestedPath: "/home/odw/mohit-panwar.jpg" },
  { id: "priyansh", name: "Priyansh", role: "Outer Delhi Warriors", portraitSrc: "", suggestedPath: "/home/odw/priyansh.jpg" },
  { id: "suyash", name: "Suyash", role: "Outer Delhi Warriors", portraitSrc: "", suggestedPath: "/home/odw/suyash.jpg" },
  { id: "harsh", name: "Harsh", role: "Outer Delhi Warriors", portraitSrc: "", suggestedPath: "/home/odw/harsh.jpg" },
  { id: "shivam", name: "Shivam", role: "Outer Delhi Warriors", portraitSrc: "", suggestedPath: "/home/odw/shivam.jpg" },
];
