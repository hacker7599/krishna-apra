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
    id: "mr-gupta",
    name: "Mr. Gupta",
    role: "League leadership",
    paragraphs: [
      "Mr. Gupta provides strategic and operational leadership for the Future Star U-15 Championship, working alongside franchise and sponsor partners to deliver a coherent Season 1 calendar, venue plan, and commercial framework.",
      "His focus is on governance, stakeholder alignment, and execution — ensuring trials, team builds, and match days run to published standards and that academies and families receive clear communication at every stage.",
      "Under this leadership, the league balances ambition with accountability: professional presentation on and off the field, transparent registration and fees, and a structure designed to scale beyond a single season.",
    ],
  },
  {
    id: "outer-delhi-warriors",
    name: "Outer Delhi Warriors",
    role: "DPL franchise · League initiative partner",
    paragraphs: [
      "Outer Delhi Warriors are a Delhi Premier League (DPL) franchise and the driving initiative behind Future Star U-15. The franchise brings franchise cricket culture — branding, match-day energy, and competitive standards — to the Under-15 age group.",
      "From trials and team identity to broadcast-style production and the High Performance Camp pathway, Outer Delhi Warriors embed the same values that define their senior franchise: community pride in Outer Delhi, disciplined cricket, and a platform where the region’s best school-age talent is seen and developed.",
      "The Warriors’ leadership team — including on-ground operators in Warriors uniform — work with academies across Delhi NCR to fill eight franchises, run structured league and knockout phases, and connect standout players to the next level of training and mentorship.",
    ],
  },
  {
    id: "naresh",
    name: "Naresh",
    role: "Operations & cricket development",
    paragraphs: [
      "Naresh plays a central role in day-to-day league operations and cricket development for Future Star U-15, coordinating between franchises, venues, and academy networks.",
      "His work covers trial zone logistics, squad and schedule management, and the practical delivery of match days — so players, coaches, and officials experience a well-run tournament rather than an ad-hoc local event.",
      "Naresh’s involvement ensures the league’s published format — groups, league games, semi-finals, and final — is executed consistently, with attention to playing conditions, equipment, and the player experience from first registration to the final whistle.",
    ],
  },
  {
    id: "subhash",
    name: "Subhash",
    role: "Operations & stakeholder relations",
    paragraphs: [
      "Subhash supports stakeholder relations and operational delivery for the championship, acting as a key link between the league office, sponsors, franchises, and participating academies.",
      "He helps align commercial commitments with on-ground reality: sponsor visibility, broadcast requirements, registration and compliance, and the information flow parents and coaches need before and during the season.",
      "Subhash’s contribution strengthens the league’s credibility as a serious junior property — one that treats partners, players, and families with the same professionalism expected at senior franchise level.",
    ],
  },
];
