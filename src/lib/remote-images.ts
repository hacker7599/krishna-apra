/** Verified Unsplash CDN URLs (free licence) — include ixlib so the CDN resolves reliably. */

const params = "ixlib=rb-4.1.0&auto=format&fit=crop";

/** Cricket match — Galle stadium, wide green field */
export const cricketMatchWide = (w: number) =>
  `https://images.unsplash.com/photo-1745180266864-85a04e5f06da?${params}&w=${w}&q=80`;

/** Group cricket — Chennai Y.M.C.A ground */
export const cricketTeamGame = (w: number) =>
  `https://images.unsplash.com/photo-1732315797079-fe90763b8bd9?${params}&w=${w}&q=80`;
