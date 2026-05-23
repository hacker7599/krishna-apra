/** Playing roles for trial registration (stored as JSON array on Registration.roles). */

export const ROLE_OPTION_GROUPS = [
  {
    label: "Batter",
    hint: "Tick one",
    options: [
      { id: "BATSMAN_OPENER", label: "Opener" },
      { id: "BATSMAN_MIDDLE", label: "Middle order" },
    ],
  },
  {
    label: "Wicket keeper",
    options: [{ id: "WICKET_KEEPER", label: "Wicket keeper" }],
  },
  {
    label: "Bowling / all-rounder",
    hint: "Tick one",
    options: [
      { id: "BOWLER_FAST", label: "Fast bowler" },
      { id: "BOWLER_SPIN", label: "Spin bowler" },
      { id: "ALL_ROUNDER_BOWLER", label: "All-rounder (bowler)" },
      { id: "ALL_ROUNDER_BATSMAN", label: "All-rounder (batsman)" },
    ],
  },
] as const;

export const ROLE_OPTIONS = ROLE_OPTION_GROUPS.flatMap((g) => g.options.map((o) => ({ id: o.id, label: o.label })));

export type RoleId = (typeof ROLE_OPTIONS)[number]["id"];

export const ROLE_IDS = ROLE_OPTIONS.map((r) => r.id) as [RoleId, ...RoleId[]];

/** Legacy role IDs from earlier seasons — shown on receipts/admin when present in DB. */
export const LEGACY_ROLE_LABELS: Record<string, string> = {
  BATSMAN: "Batter",
  ALL_ROUNDER: "All-rounder",
  BOWLER: "Bowler",
  SPINNER: "Spin bowler",
};

const MUTEX_GROUPS: RoleId[][] = [
  ["BATSMAN_OPENER", "BATSMAN_MIDDLE"],
  ["BOWLER_FAST", "BOWLER_SPIN", "ALL_ROUNDER_BOWLER", "ALL_ROUNDER_BATSMAN"],
];

const roleLabelMap = Object.fromEntries([
  ...ROLE_OPTIONS.map((r) => [r.id, r.label] as const),
  ...Object.entries(LEGACY_ROLE_LABELS),
]);

export function isRoleId(id: string): id is RoleId {
  return ROLE_IDS.includes(id as RoleId);
}

export function toggleRegistrationRole(prev: Set<RoleId>, id: RoleId): Set<RoleId> {
  const next = new Set(prev);
  if (next.has(id)) {
    next.delete(id);
    return next;
  }
  for (const group of MUTEX_GROUPS) {
    if (group.includes(id)) {
      for (const other of group) next.delete(other);
      break;
    }
  }
  next.add(id);
  return next;
}

export function formatRoleLabels(roleIds: string[]): string[] {
  return roleIds.map((id) => roleLabelMap[id] ?? id);
}
