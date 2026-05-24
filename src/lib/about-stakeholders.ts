import { OUTER_DELHI_WARRIORS_LOGO_SRC } from "@/lib/branding";

/** Leadership & partners — About page. Order matches published site sequence. */

export type AboutStakeholder = {
  id: string;
  name: string;
  role: string;
  paragraphs: string[];
  portraitSrc?: string;
  /** Official logo (e.g. title sponsor) instead of portrait */
  logoSrc?: string;
};

/** Title / franchise partners (shown before league leadership). */
export const ABOUT_PARTNERS: AboutStakeholder[] = [
  {
    id: "krishna-apra",
    name: "Krishna Apra",
    role: "Title sponsor",
    logoSrc: "/branding/krishna-apra.png",
    paragraphs: [
      "Krishna Apra Group brings an innovative, professional approach to real estate across Delhi NCR. With a legacy of more than 28 years, the group is a trusted name in residential and commercial development — known for quality construction, on-time delivery, and ethical standards in every project.",
      "The group’s track record includes over 20 lakh sq. ft. of delivered residential space and 10 lakh sq. ft. of commercial development, with landmark projects from Krishna Apra Garden and Residency to business and retail destinations across Noida and New Delhi. Krishna Apra has long stood for trust — building communities where families live, work, and grow.",
      "As title sponsor of Future Star U-15 Season 1, Krishna Apra extends that same commitment to youth cricket in Delhi NCR: supporting structured trials, franchise standards, and a pathway where young players compete in a professional, broadcast-ready environment.",
    ],
  },
  {
    id: "outer-delhi-warriors",
    name: "Outer Delhi Warriors",
    role: "DPL franchise · League initiative partner",
    logoSrc: OUTER_DELHI_WARRIORS_LOGO_SRC,
    paragraphs: [
      "Outer Delhi Warriors are a Delhi Premier League (DPL) franchise and the driving initiative behind Future Star U-15. The franchise brings franchise cricket culture — branding, match-day energy, and competitive standards — to the Under-15 age group.",
      "From trials and team identity to broadcast-style production and the High Performance Camp pathway, Outer Delhi Warriors embed the same values that define their senior franchise: community pride in Outer Delhi, disciplined cricket, and a platform where the region’s best school-age talent is seen and developed.",
      "The Warriors’ leadership team work with academies across Delhi NCR to fill eight franchises, run structured league and knockout phases, and connect standout players to the next level of training and mentorship.",
    ],
  },
];

/** League leadership — display order on /about (after partners). */
export const ABOUT_LEADERSHIP: AboutStakeholder[] = [
  {
    id: "naresh",
    name: "Naresh Panwar",
    role: "President",
    portraitSrc: "/home/about/naresh.jpg",
    paragraphs: [
      "Naresh Panwar serves as President of Future Star U-15, providing overall leadership for the championship’s vision, governance, and Season 1 delivery across Delhi NCR.",
      "In this role he oversees stakeholder alignment between the title sponsor, franchise partners, academies, and the league office — ensuring trials, team builds, and match days meet published professional standards.",
      "His leadership keeps the tournament accountable and ambitious: transparent registration, structured competition from groups through to the final, and a player experience that reflects senior franchise-level seriousness.",
    ],
  },
  {
    id: "mr-gupta",
    name: "Manish Gupta",
    role: "Owner · Krishna Apra Group",
    portraitSrc: "/home/about/manish-gupta.jpg",
    paragraphs: [
      "Manish Gupta is a prominent Indian real estate developer and executive who serves as a key Director and driving force behind the Krishna Apra group of companies, including Krishna Apra Estates Private Limited.",
      "Under his corporate leadership, the group — often collaborating under the wider Mapsko umbrella — has established a formidable footprint across major National Capital Region hubs including Noida, Ghaziabad, and Greater Noida.",
      "As owner of the Krishna Apra Group and title sponsor of Future Star U-15, Manish Gupta brings the same standards of scale, governance, and long-term commitment to junior cricket that define the group’s work in real estate and community development across Delhi NCR.",
    ],
  },
  {
    id: "sanjay-rawat",
    name: "Sanjay Rawat",
    role: "Secretary of the league",
    portraitSrc: "/home/about/sanjay-rawat.jpg",
    paragraphs: [
      "Sanjay Rawat serves as Secretary of the Future Star U-15 league, supporting the President and league office with governance, documentation, and day-to-day coordination across Season 1.",
      "In this role he helps maintain clear communication with franchises, academies, and sponsors — keeping schedules, registrations, and official records aligned with published tournament standards.",
      "His work strengthens the league’s organisational backbone so trials, fixtures, and stakeholder commitments run smoothly from planning through to match day.",
    ],
  },
  {
    id: "subhash",
    name: "Subhash Rajput",
    role: "Operations & stakeholder relations",
    portraitSrc: "/home/about/subhash.jpg",
    paragraphs: [
      "Subhash Rajput supports stakeholder relations and operational delivery for the championship, acting as a key link between the league office, sponsors, franchises, and participating academies.",
      "He helps align commercial commitments with on-ground reality: sponsor visibility, broadcast requirements, registration and compliance, and the information flow parents and coaches need before and during the season.",
      "Subhash Rajput’s contribution strengthens the league’s credibility as a serious junior property — one that treats partners, players, and families with the same professionalism expected at senior franchise level.",
    ],
  },
  {
    id: "vishal-sharma",
    name: "Vishal Sharma",
    role: "League CEO",
    portraitSrc: "/home/about/vishal-sharma.jpg",
    paragraphs: [
      "Vishal Sharma serves as League CEO of Future Star U-15, leading day-to-day execution of Season 1 across trials, franchises, commercial delivery, and broadcast operations.",
      "In this role he coordinates the league office, title sponsor, and franchise partners — turning the championship vision into schedules, registrations, and match-day delivery parents and academies can rely on.",
      "As CEO he keeps the programme accountable to its published standards: transparent fees, structured competition, and a junior tournament built to the same seriousness as senior franchise cricket in Delhi NCR.",
    ],
  },
];

/** Full About page sequence: partners first, then leadership. */
export const ABOUT_STAKEHOLDERS: AboutStakeholder[] = [...ABOUT_PARTNERS, ...ABOUT_LEADERSHIP];
