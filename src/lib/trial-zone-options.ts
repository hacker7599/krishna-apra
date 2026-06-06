export type TrialZoneOption = {
  id: string;
  trialPlace: string;
  zone: string;
  /** When false, show on registration UI but not selectable. Defaults to true. */
  registrationOpen?: boolean;
};

import { trialVenueDisplayLabel } from "@/lib/trial-zone-catalog";

export function trialZoneSelectLabel(z: TrialZoneOption): string {
  return trialVenueDisplayLabel(z);
}
