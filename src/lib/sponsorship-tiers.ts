import { CO_POWERED_BY_SPONSOR } from "@/lib/league";

export type SponsorshipRow = {
  label: string;
  /** Shown right-aligned; omit for bullet-style inclusions (renders as included). */
  value?: string;
};

export type SponsorshipColumn = {
  title: string;
  rows: SponsorshipRow[];
};

export type SponsorshipTier = {
  id: string;
  /** First word(s) in amber, remainder in white — matches flyer split. */
  headlineAmber: string;
  headlineWhite: string;
  /** e.g. "INR 30 lakhs" */
  price: string;
  columns: SponsorshipColumn[];
};

export const SPONSORSHIP_TIERS: SponsorshipTier[] = [
  {
    id: "title-sponsor",
    headlineAmber: "Title",
    headlineWhite: "sponsor",
    price: "INR 30 lakhs",
    columns: [
      {
        title: "In-stadia branding",
        rows: [
          { label: "Pitch mat (behind the wicket)", value: "2" },
          { label: "Perimeter", value: "12" },
          { label: "Boundary ropes branding", value: "20%" },
          { label: "Sight screen", value: "20 overs" },
          { label: "Stump branding", value: "100%" },
          { label: "Backdrop (PMP / comm.)", value: "20%" },
          { label: "Dugout backdrop logo", value: "20%" },
          { label: "Broadcast-linked leaderboard & award (MVP + TV scorecard)", value: "2" },
          { label: "Ball boy branding", value: "100%" },
          { label: "Perimeter loop branding (stoppage in play)", value: "Yes" },
          { label: "Composite logo on players’ jersey", value: "Yes" },
          { label: "Cheering material (4s / 6s)", value: "Yes" },
          { label: "TVC spots on giant screen — pre-match", value: "Yes" },
        ],
      },
      {
        title: "TV branding",
        rows: [
          { label: "Integrated naming logo unit", value: "Yes" },
          { label: "Sponsor verbal mentions", value: "Yes" },
        ],
      },
      {
        title: "Promotion & social media",
        rows: [
          { label: "Trophy, IP rights & tournament logo", value: "Yes" },
          { label: "Image rights of cricketers", value: "Yes" },
          { label: "Stock footage of tournament", value: "6" },
          { label: "Match images", value: "25" },
          { label: "Future Star promotional activities (physical / on-ground)" },
          { label: "Sponsor shout-out posts" },
          { label: "Mention on website" },
          { label: "Cross-promotional activations" },
          { label: "Digital activations (contest / quiz / giveaways)" },
        ],
      },
    ],
  },
  {
    id: "powered-by-25",
    headlineAmber: "Powered by",
    headlineWhite: "sponsor",
    price: "INR 25 lakhs",
    columns: [
      {
        title: "In-stadia branding",
        rows: [
          { label: "Pitch mat (behind the wicket)", value: "1" },
          { label: "Perimeter", value: "8" },
          { label: "Boundary ropes branding", value: "10%" },
          { label: "Backdrop (PMP / comm.)", value: "7.5%" },
          { label: "Dugout backdrop logo", value: "7.5%" },
          { label: "Sight screen", value: "10 overs" },
          { label: "Broadcast-linked leaderboard & award (Orange Cap / Purple Cap)", value: "1" },
          { label: "Perimeter logo branding (stoppage in play)", value: "Yes" },
          { label: "Cheering material (4s / 6s)", value: "Yes" },
          { label: "TV spots on giant screen — pre-match", value: "Yes" },
        ],
      },
      {
        title: "TV branding",
        rows: [{ label: "Sponsor verbal mentions", value: "Yes" }],
      },
      {
        title: "Promotion & social media",
        rows: [
          { label: "Image rights of cricketers", value: "Yes" },
          { label: "Stock footage of tournament", value: "3" },
          { label: "Match images", value: "25" },
          { label: "Future Star promotional activities (physical / on-ground)" },
          { label: "Sponsor shout-out posts" },
          { label: "Mention on website" },
          { label: "Cross-promotional activations" },
          { label: "Digital activations (contest / quiz / giveaways)" },
        ],
      },
    ],
  },
  {
    id: "co-powered-by",
    headlineAmber: "Co powered by",
    headlineWhite: CO_POWERED_BY_SPONSOR,
    price: "INR 20 lakhs",
    columns: [
      {
        title: "In-stadia branding",
        rows: [
          { label: "Mid-wicket mat", value: "1" },
          { label: "Perimeter boards", value: "6" },
          { label: "Boundary ropes branding", value: "5%" },
          { label: "Dugout backdrop logo", value: "5%" },
          { label: "Logo on giant screen", value: "Shared" },
          { label: "Broadcast-linked property (customised)", value: "1" },
          { label: "Perimeter logo branding (stoppage in play)", value: "Yes" },
          { label: "TV spots on giant screen — pre-match", value: "Yes" },
        ],
      },
      {
        title: "TV branding",
        rows: [{ label: "Sponsor verbal mentions", value: "Yes" }],
      },
      {
        title: "Promotion & social media",
        rows: [
          { label: "Image rights of cricketers", value: "Yes" },
          { label: "Stock footage of tournament", value: "2" },
          { label: "Match images", value: "25" },
          { label: "Future Star promotional activities (physical / on-ground)" },
          { label: "Sponsor shout-out posts" },
          { label: "Mention on website" },
          { label: "Cross-promotional activations" },
          { label: "Digital activations (contest / quiz / giveaways)" },
        ],
      },
    ],
  },
];
