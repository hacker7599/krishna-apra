import { LEGAL_ENTITY } from "@/lib/site-legal";

export const TITLE_SPONSOR = "Krishna Apra";
export const LEAGUE_NAME = "Future Star";
export const LEAGUE_SUBTITLE = "Under-15 Cricket League";
export const REGION = "Delhi NCR";
export const TAGLINE = "Where Future Stars Begin Their Journey.";

/** Credited on the homepage as the organising initiative behind the league. */
export const LEAGUE_INITIATIVE_BY = "Outer Delhi Warriors";
export const TRIAL_FEE_INR = 1299;

/** League desk support lines shown on contact, footer, and registration help. */
export const REGISTRATION_SUPPORT_PHONES = [
  "+917678255437",
  "+919818251516",
  "+919719799909",
] as const;

/** Primary support line (first in list). */
export const REGISTRATION_SUPPORT_PHONE = REGISTRATION_SUPPORT_PHONES[0];

/** League desk support email shown across the public site. */
export const REGISTRATION_SUPPORT_EMAIL = LEGAL_ENTITY.contactEmail;

/**
 * Age cut-off from the official trial form: “AGE CUT OFF 1 AUG 2010”.
 * Players must be born **after** this date (1 August 2010 or earlier = not eligible).
 */
export const PLAYER_AGE_CUTOFF_DATE = "2010-08-01";

/** First eligible date of birth (inclusive) — day after the cut-off. */
export const PLAYER_AGE_MIN_BIRTH_DATE = "2010-08-02";

/** Latest selectable DOB for the date picker (today — any year after the cut-off is allowed). */
export function playerDateOfBirthMaxIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export const VENUE =
  "Nawab Mansur Ali Khan Pataudi Sports Complex (Jamia Millia Islamia Cricket Ground), New Delhi";
/** Public trial window copy (homepage, schedule, offline form, announcement bar). */
export const SEASON_START = "6 June to 12 June 2026";

/** Default trial schedule window (IST) — used by seeds; admin can adjust per entry. */
export const TRIAL_SCHEDULE_START_ISO = "2026-06-06T09:00:00+05:30";
export const TRIAL_SCHEDULE_END_ISO = "2026-06-12T18:00:00+05:30";

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

export {
  ROLE_OPTION_GROUPS,
  ROLE_OPTIONS,
  type RoleId,
  toggleRegistrationRole,
  formatRoleLabels,
  isRoleId,
} from "@/lib/registration-roles";

export const TEAMS = [
  { name: "Central Delhi Titans", city: "Central Delhi", accent: "#22c55e" },
  { name: "North Delhi Strikers", city: "North Delhi", accent: "#38bdf8" },
  { name: "South Delhi Royals", city: "South Delhi", accent: "#f472b6" },
  { name: "East Delhi Thunder", city: "East Delhi", accent: "#fbbf24" },
  { name: "West Delhi Knights", city: "West Delhi", accent: "#a78bfa" },
  { name: "NCR Phoenix", city: "NCR", accent: "#fb7185" },
  { name: "Yamuna Blazers", city: "Yamuna Bank", accent: "#34d399" },
  { name: "Capital Colts", city: "Central Delhi", accent: "#f97316" },
] as const;
