/** Official printed trial schedule — synced via `npm run db:seed:trial-schedule` only. */

export type OfficialTrialVenueKey = {
  trialPlace: string;
  zone: string;
};

export type OfficialTrialScheduleDay = {
  day: number;
  weekday: string;
  /** Calendar date in IST (YYYY-MM-DD). */
  date: string;
  venues: OfficialTrialVenueKey[];
};

/** Matches the published TRIAL SCHEDULE graphic (6–12 June 2026). */
export const OFFICIAL_TRIAL_SCHEDULE_DAYS: OfficialTrialScheduleDay[] = [
  {
    day: 1,
    weekday: "Saturday",
    date: "2026-06-06",
    venues: [
      { trialPlace: "IIMT Ganga Nagar Meerut", zone: "Meerut" },
      { trialPlace: "Sarvodaya Co Education Sr Sec School", zone: "Chanakyapuri, New Delhi" },
      { trialPlace: "Anssh Academy", zone: "Kalyan, Maharashtra" },
    ],
  },
  {
    day: 2,
    weekday: "Sunday",
    date: "2026-06-07",
    venues: [{ trialPlace: "Delhi Public School, Meerut Road", zone: "Ghaziabad" }],
  },
  {
    day: 3,
    weekday: "Monday",
    date: "2026-06-08",
    venues: [
      { trialPlace: "ACA Centre of Excellence, Bijwasan", zone: "Gurugram" },
      { trialPlace: "Kothari International School", zone: "Sector 50, Noida" },
      { trialPlace: "Alpha Cricket Academy", zone: "Jaipur" },
    ],
  },
  {
    day: 4,
    weekday: "Tuesday",
    date: "2026-06-09",
    venues: [
      { trialPlace: "Prakash Sports Academy", zone: "Haridwar" },
      { trialPlace: "Jayqo Sports Complex", zone: "Faridabad" },
    ],
  },
  {
    day: 5,
    weekday: "Wednesday",
    date: "2026-06-10",
    venues: [
      { trialPlace: "Gurukul Cricket Academy", zone: "Dehradun" },
      { trialPlace: "ST. Michaels Cricket Academy", zone: "Bhopal" },
    ],
  },
  {
    day: 6,
    weekday: "Thursday",
    date: "2026-06-11",
    venues: [
      { trialPlace: "Nawab Mansur Ali Khan Pataudi Sports Complex", zone: "New Delhi" },
      { trialPlace: "Gaur City Stadium", zone: "Greater Noida" },
    ],
  },
  {
    day: 7,
    weekday: "Friday",
    date: "2026-06-12",
    venues: [{ trialPlace: "Shree Shyam Cricket Academy", zone: "Bahadurgarh" }],
  },
];

export const OFFICIAL_TRIAL_REPORT_TIME = "09:00";
export const OFFICIAL_TRIAL_END_TIME = "18:00";
export const OFFICIAL_TRIAL_DAY_NOTES =
  "Report 30 minutes early with ID proof and registration confirmation.";

const VENUE_NOTE_PREFIX = "VENUE:";

export function officialVenueKey(v: OfficialTrialVenueKey): string {
  return `${v.trialPlace}\0${v.zone}`;
}

export function scheduleVenueNoteLine(v: OfficialTrialVenueKey): string {
  return `${VENUE_NOTE_PREFIX}${v.trialPlace}|${v.zone}`;
}

export function parseScheduleVenueNote(notes: string | null | undefined): OfficialTrialVenueKey | null {
  if (!notes) return null;
  const line = notes.split("\n").find((l) => l.startsWith(VENUE_NOTE_PREFIX));
  if (!line) return null;
  const payload = line.slice(VENUE_NOTE_PREFIX.length);
  const sep = payload.indexOf("|");
  if (sep < 0) return null;
  const trialPlace = payload.slice(0, sep).trim();
  const zone = payload.slice(sep + 1).trim();
  if (!trialPlace || !zone) return null;
  return { trialPlace, zone };
}

export function buildScheduleEntryNotes(venue: OfficialTrialVenueKey): string {
  return `${scheduleVenueNoteLine(venue)}\n${OFFICIAL_TRIAL_DAY_NOTES}`;
}

export function scheduleEntryTitle(day: OfficialTrialScheduleDay, venue: OfficialTrialVenueKey): string {
  return `Day ${day.day} — ${venue.trialPlace}`;
}

/** Optional link to an existing TrialZone row when names differ slightly in the DB. */
export const SCHEDULE_TRIAL_ZONE_LINKS: Partial<Record<string, OfficialTrialVenueKey>> = {
  [officialVenueKey({ trialPlace: "Kothari International School", zone: "Sector 50, Noida" })]: {
    trialPlace: "Kothari International School",
    zone: "Sector 50, Noida",
  },
  [officialVenueKey({ trialPlace: "ACA Centre of Excellence, Bijwasan", zone: "Gurugram" })]: {
    trialPlace: "ACA Centre of Excellence, Bijwasan",
    zone: "Gurugram",
  },
  [officialVenueKey({ trialPlace: "Prakash Sports Academy", zone: "Haridwar" })]: {
    trialPlace: "Prakash Sports Academy",
    zone: "Haridwar",
  },
  [officialVenueKey({ trialPlace: "Jayqo Sports Complex", zone: "Faridabad" })]: {
    trialPlace: "Jayqo Sports Complex",
    zone: "Faridabad",
  },
  [officialVenueKey({ trialPlace: "Gurukul Cricket Academy", zone: "Dehradun" })]: {
    trialPlace: "Gurukul Cricket Academy",
    zone: "Dehradun",
  },
  [officialVenueKey({ trialPlace: "Gaur City Stadium", zone: "Greater Noida" })]: {
    trialPlace: "Gaur City Stadium",
    zone: "Greater Noida",
  },
  [officialVenueKey({ trialPlace: "Sarvodaya Co Education Sr Sec School", zone: "Chanakyapuri, New Delhi" })]: {
    trialPlace: "Sarvodaya Co Education Sr Sec School",
    zone: "Chanakyapuri",
  },
  [officialVenueKey({ trialPlace: "Delhi Public School, Meerut Road", zone: "Ghaziabad" })]: {
    trialPlace: "Delhi Public School",
    zone: "Ghaziabad",
  },
};
