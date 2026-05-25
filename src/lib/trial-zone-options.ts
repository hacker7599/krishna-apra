export type TrialZoneOption = {
  id: string;
  trialPlace: string;
  zone: string;
};

import { trialVenueDisplayLabel } from "@/lib/trial-zone-catalog";

export function trialZoneSelectLabel(z: TrialZoneOption): string {
  return trialVenueDisplayLabel(z);
}
