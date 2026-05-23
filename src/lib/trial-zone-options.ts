export type TrialZoneOption = {
  id: string;
  trialPlace: string;
  zone: string;
};

export function trialZoneSelectLabel(z: TrialZoneOption): string {
  return `${z.trialPlace} — ${z.zone}`;
}
