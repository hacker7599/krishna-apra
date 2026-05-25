/** Playing roles for trial registration (stored as JSON array on Registration.roles). */

export type RoleOption = { id: string; label: string };

export type RoleSubsection = {
  letter: string;
  label: string;
  options: readonly RoleOption[];
  /** Only one batter type / one bowler type at a time */
  pickOne?: boolean;
};

export type RoleStandalone = {
  letter: string;
  label: string;
  id: string;
};

/** Matches official paper form: a) Batter, b) Bowler, c) All rounder, d) Wicketkeeper */
export const PLAYER_ROLE_BATTER: RoleSubsection = {
  letter: "a",
  label: "Batter",
  pickOne: true,
  options: [
    { id: "BATTER_TOP_ORDER", label: "Top order" },
    { id: "BATTER_MIDDLE_ORDER", label: "Middle order" },
  ],
};

export const PLAYER_ROLE_BOWLER: RoleSubsection = {
  letter: "b",
  label: "Bowler",
  pickOne: true,
  options: [
    { id: "BOWLER_FAST", label: "Fast" },
    { id: "BOWLER_SPINNER", label: "Spinner" },
  ],
};

export const PLAYER_ROLE_ALL_ROUNDER: RoleStandalone = {
  letter: "c",
  label: "All rounder",
  id: "ALL_ROUNDER",
};

export const PLAYER_ROLE_WICKETKEEPER: RoleStandalone = {
  letter: "d",
  label: "Wicketkeeper",
  id: "WICKET_KEEPER",
};

/** @deprecated Use PLAYER_ROLE_* — kept for imports that iterate groups */
export const ROLE_OPTION_GROUPS = [
  { label: PLAYER_ROLE_BATTER.label, hint: "Tick one", options: [...PLAYER_ROLE_BATTER.options] },
  {
    label: PLAYER_ROLE_BOWLER.label,
    hint: "Tick one",
    options: [...PLAYER_ROLE_BOWLER.options],
  },
  { label: PLAYER_ROLE_ALL_ROUNDER.label, options: [{ id: PLAYER_ROLE_ALL_ROUNDER.id, label: PLAYER_ROLE_ALL_ROUNDER.label }] },
  { label: PLAYER_ROLE_WICKETKEEPER.label, options: [{ id: PLAYER_ROLE_WICKETKEEPER.id, label: PLAYER_ROLE_WICKETKEEPER.label }] },
] as const;

export const ROLE_OPTIONS = [
  ...PLAYER_ROLE_BATTER.options,
  ...PLAYER_ROLE_BOWLER.options,
  { id: PLAYER_ROLE_ALL_ROUNDER.id, label: PLAYER_ROLE_ALL_ROUNDER.label },
  { id: PLAYER_ROLE_WICKETKEEPER.id, label: PLAYER_ROLE_WICKETKEEPER.label },
] as const;

export type RoleId = (typeof ROLE_OPTIONS)[number]["id"];

export const ROLE_IDS = ROLE_OPTIONS.map((r) => r.id) as [RoleId, ...RoleId[]];

/** Legacy role IDs — shown on receipts/admin when present in DB */
export const LEGACY_ROLE_LABELS: Record<string, string> = {
  BATSMAN: "Batter",
  BATSMAN_OPENER: "Top order",
  BATSMAN_MIDDLE: "Middle order",
  BOWLER: "Fast",
  SPINNER: "Spinner",
  BOWLER_SPIN: "Spinner",
  ALL_ROUNDER_BOWLER: "All rounder",
  ALL_ROUNDER_BATSMAN: "All rounder",
};

const MUTEX_GROUPS: RoleId[][] = [
  ["BATTER_TOP_ORDER", "BATTER_MIDDLE_ORDER"],
  ["BOWLER_FAST", "BOWLER_SPINNER"],
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
