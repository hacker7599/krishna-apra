/** Season 1 estimated reach — homepage media exposure data */

export type ReachMetric = {
  id: string;
  value: string;
  unit: string;
  label: string;
  sublabel?: string;
  /** Desktop zigzag timeline: above or below the axis */
  position: "above" | "below";
};

export const ESTIMATED_REACH_HEADLINE = "100M+";
export const ESTIMATED_REACH_HEADLINE_NOTE = "Projected cross-channel impressions · Season 1";

export const ESTIMATED_REACH_METRICS: ReachMetric[] = [
  {
    id: "broadcast",
    value: "26.3",
    unit: "Million",
    label: "Broadcast",
    sublabel: "Weekly reach",
    position: "below",
  },
  {
    id: "print-pr",
    value: "22.5",
    unit: "Million",
    label: "Print & PR",
    sublabel: "National & regional dailies, press conferences",
    position: "above",
  },
  {
    id: "radio",
    value: "12",
    unit: "Million",
    label: "Radio audience",
    sublabel: "Across team states",
    position: "below",
  },
  {
    id: "social",
    value: "26.3",
    unit: "Million",
    label: "Social media",
    sublabel: "Impressions across verticals",
    position: "above",
  },
  {
    id: "spectators",
    value: "19",
    unit: "Million",
    label: "Spectators",
    sublabel: "Total in-venue audience",
    position: "below",
  },
  {
    id: "non-traditional",
    value: "72K",
    unit: "",
    label: "Non-traditional",
    sublabel: "Activations & partner networks",
    position: "above",
  },
];
