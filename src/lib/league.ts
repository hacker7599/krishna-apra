export const TITLE_SPONSOR = "Krishna Apra";
export const LEAGUE_NAME = "Future Star";
export const LEAGUE_SUBTITLE = "Under-15 Cricket League";
export const REGION = "Delhi NCR";
export const TAGLINE = "Where Future Stars Begin Their Journey.";
export const TRIAL_FEE_INR = 1299;

/**
 * Latest allowed date of birth (inclusive). Registrations with DOB strictly after this ISO date are rejected.
 * Matches the printed line: “AGE CUT OFF AUG 1 2010” together with “players born after … are not eligible.”
 * If your season uses a different as-on rule, change this string (YYYY-MM-DD).
 */
export const PLAYER_AGE_CUTOFF_DATE = "2010-08-01";
export const VENUE =
  "Nawab Mansur Ali Khan Pataudi Sports Complex (Jamia Millia Islamia Cricket Ground), New Delhi";
export const SEASON_START = "29 May 2026";

/** Official YouTube channel (streams / highlights). Empty string hides the button until you have the URL. */
export const STREAMING_YOUTUBE_URL = "";
export const FORMAT = {
  teams: 8,
  groups: 2,
  leagueMatches: 15,
  semiFinals: 2,
  final: 1,
  overs: 20,
  category: "Under-15",
  /** Live broadcast cameras (Season 1 graphic). */
  cameraLive: 8,
};

export const ROLE_OPTIONS = [
  { id: "BATSMAN", label: "Batter" },
  { id: "ALL_ROUNDER", label: "All Rounder" },
  { id: "WICKET_KEEPER", label: "Wicket Keeper" },
  { id: "BOWLER", label: "Bowler" },
  { id: "SPINNER", label: "Spinner" },
] as const;

export type RoleId = (typeof ROLE_OPTIONS)[number]["id"];

export const TEAMS = [
  { name: "Outer Delhi Warriors", city: "Outer Delhi", accent: "#22c55e" },
  { name: "North Delhi Strikers", city: "North Delhi", accent: "#38bdf8" },
  { name: "South Delhi Royals", city: "South Delhi", accent: "#f472b6" },
  { name: "East Delhi Thunder", city: "East Delhi", accent: "#fbbf24" },
  { name: "West Delhi Knights", city: "West Delhi", accent: "#a78bfa" },
  { name: "NCR Phoenix", city: "NCR", accent: "#fb7185" },
  { name: "Yamuna Blazers", city: "Yamuna Bank", accent: "#34d399" },
  { name: "Capital Colts", city: "Central Delhi", accent: "#f97316" },
] as const;
