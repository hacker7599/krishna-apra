/** Official trial venues (section 12 — paper registration form). Synced to DB via prisma seed. */

export type OfficialTrialVenue = {
  trialPlace: string;
  zone: string;
  address: string;
  navigationUrl: string;
  contactDetails: string;
};

function mapsSearch(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const OFFICIAL_TRIAL_VENUES: OfficialTrialVenue[] = [
  {
    trialPlace: "Kothari International School",
    zone: "Sector 50, Noida",
    address: "Kothari International School, Sector 50, Noida",
    navigationUrl: mapsSearch("Kothari International School Sector 50 Noida"),
    contactDetails: "Report to on-site league desk on trial day.",
  },
  {
    trialPlace: "Delhi Public School",
    zone: "Ghaziabad",
    address: "Delhi Public School, Ghaziabad",
    navigationUrl: mapsSearch("Delhi Public School Ghaziabad cricket"),
    contactDetails: "Report to on-site league desk on trial day.",
  },
  {
    trialPlace: "J.S.M. Group",
    zone: "Meerut",
    address: "J.S.M. Group, Meerut",
    navigationUrl: mapsSearch("JSM Group Meerut cricket"),
    contactDetails: "Report to on-site league desk on trial day.",
  },
  {
    trialPlace: "ACA Centre of Excellence, Bijwasan",
    zone: "Gurugram",
    address: "ACA Centre of Excellence, Bijwasan, Gurugram",
    navigationUrl: mapsSearch("ACA Centre of Excellence Bijwasan Gurugram"),
    contactDetails: "Report to on-site league desk on trial day.",
  },
  {
    trialPlace: "Jayqo Sports Complex",
    zone: "Faridabad",
    address: "Jayqo Sports Complex, Faridabad",
    navigationUrl: mapsSearch("Jayqo Sports Complex Faridabad"),
    contactDetails: "Report to on-site league desk on trial day.",
  },
  {
    trialPlace: "Sarvodaya Co Education Sr Sec School",
    zone: "Chanakyapuri",
    address: "Sarvodaya Co Education Sr Sec School, Chanakyapuri, New Delhi",
    navigationUrl: mapsSearch("Sarvodaya Co Education Sr Sec School Chanakyapuri"),
    contactDetails: "Report to on-site league desk on trial day.",
  },
  {
    trialPlace: "Prakash Sports Academy",
    zone: "Haridwar",
    address: "Prakash Sports Academy, Haridwar",
    navigationUrl: mapsSearch("Prakash Sports Academy Haridwar"),
    contactDetails: "Report to on-site league desk on trial day.",
  },
  {
    trialPlace: "Gurukul Cricket Academy",
    zone: "Dehradun",
    address: "Gurukul Cricket Academy, Dehradun",
    navigationUrl: mapsSearch("Gurukul Cricket Academy Dehradun"),
    contactDetails: "Report to on-site league desk on trial day.",
  },
  {
    trialPlace: "Jawaharlal Nehru Stadium",
    zone: "Ghaziabad, Uttar Pradesh",
    address: "Jawaharlal Nehru Stadium, Ghaziabad, Uttar Pradesh",
    navigationUrl: mapsSearch("Jawaharlal Nehru Stadium Ghaziabad Uttar Pradesh"),
    contactDetails: "Report to on-site league desk on trial day.",
  },
  {
    trialPlace: "Gaur City Stadium",
    zone: "Greater Noida",
    address: "Gaur City Stadium, Greater Noida",
    navigationUrl: mapsSearch("Gaur City Stadium Greater Noida"),
    contactDetails: "Report to on-site league desk on trial day.",
  },
];

/** Full line as on paper form / dropdown */
export function trialVenueDisplayLabel(v: { trialPlace: string; zone: string }): string {
  return `${v.trialPlace} - ${v.zone}`;
}
