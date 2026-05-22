import { OUTER_DELHI_WARRIORS_LOGO_SRC } from "@/lib/branding";

/** Leadership & partners — About page. Update copy and portraitSrc when bios and photos are final. */

export type AboutStakeholder = {
  id: string;
  name: string;
  role: string;
  paragraphs: string[];
  portraitSrc?: string;
  /** Official logo (e.g. title sponsor) instead of portrait */
  logoSrc?: string;
};

export const ABOUT_STAKEHOLDERS: AboutStakeholder[] = [
  {
    id: "krishna-apra",
    name: "Krishna Apra",
    role: "Title sponsor",
    logoSrc: "/branding/krishna-apra.png",
    paragraphs: [
      "Krishna Apra is the title sponsor of Future Star U-15 Season 1, anchoring the league’s commercial foundation and its commitment to structured junior cricket in Delhi NCR.",
      "Through this partnership, Krishna Apra supports trial infrastructure, franchise operations, kit and match-day standards, and the pathway from grassroots discovery to high-performance camps — so young cricketers compete in an environment that mirrors professional T20 leagues.",
      "The brand’s involvement signals long-term investment in youth sport: not a one-off event, but a repeatable platform where academies, parents, and players can trust the process from registration through to selection and broadcast exposure.",
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
      "The Warriors’ leadership team — including on-ground operators in Warriors uniform — work with academies across Delhi NCR to fill eight franchises, run structured league and knockout phases, and connect standout players to the next level of training and mentorship.",
    ],
  },
  {
    id: "mr-gupta",
    name: "Manish Gupta",
    role: "Owner · Krishna Apra Group",
    paragraphs: [
      "Manish Gupta is a prominent Indian real estate developer and executive who serves as a key Director and driving force behind the Krishna Apra group of companies, including Krishna Apra Estates Private Limited.",
      "Under his corporate leadership, the group — often collaborating under the wider Mapsko umbrella — has established a formidable footprint across major National Capital Region hubs including Noida, Ghaziabad, and Greater Noida.",
      "As owner of the Krishna Apra Group and title sponsor of Future Star U-15, Manish Gupta brings the same standards of scale, governance, and long-term commitment to junior cricket that define the group’s work in real estate and community development across Delhi NCR.",
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
    id: "mohit-panwar",
    name: "Mohit Panwar",
    role: "Player · Outer Delhi Warriors",
    portraitSrc: "/home/about/mohit-panwar.jpg",
    paragraphs: [
      "Mohit Panwar represents Outer Delhi Warriors in the Future Star U-15 programme — part of the franchise squad that brings competitive cricket and professional match-day standards to Season 1.",
      "In Warriors colours he helps embody the initiative’s energy on the ground: disciplined preparation, franchise pride, and the pathway from academy trials to structured league cricket in Delhi NCR.",
      "Players like Mohit connect grassroots talent with a broadcast-ready tournament — showing school-age cricketers what it means to compete under a serious franchise banner.",
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
];
