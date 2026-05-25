import { OfflineFormSection, OfflinePrintCheckbox } from "@/components/offline-form-primitives";
import type { TrialZoneOption } from "@/lib/trial-zone-options";
import { trialZoneSelectLabel } from "@/lib/trial-zone-options";
import { OFFICIAL_TRIAL_VENUES } from "@/lib/trial-zone-catalog";

export function OfflineTrialVenueFields({ trialZones }: { trialZones: TrialZoneOption[] }) {
  const venues =
    trialZones.length > 0
      ? trialZones.map((z) => ({ key: z.id, label: trialZoneSelectLabel(z).toUpperCase() }))
      : OFFICIAL_TRIAL_VENUES.map((v, i) => ({
          key: `catalog-${i}`,
          label: `${v.trialPlace} - ${v.zone}`.toUpperCase(),
        }));

  return (
    <OfflineFormSection number="12" title="Select trial venue" hint="Tick one venue where you plan to attend trials.">
      <div className="offline-venue-grid">
        {venues.map((v) => (
          <OfflinePrintCheckbox key={v.key} label={v.label} />
        ))}
      </div>
    </OfflineFormSection>
  );
}
