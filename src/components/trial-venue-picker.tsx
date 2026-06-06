"use client";

import type { TrialZoneOption } from "@/lib/trial-zone-options";
import { trialZoneSelectLabel } from "@/lib/trial-zone-options";

type Props = {
  trialZones: TrialZoneOption[];
  value: string;
  onChange: (id: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  name?: string;
};

function isZoneSelectable(z: TrialZoneOption): boolean {
  return z.registrationOpen !== false;
}

/** Radio cards — open venues selectable; closed venues visible but disabled. */
export function TrialVenuePicker({ trialZones, value, onChange, hasError, disabled, name = "trialZoneId" }: Props) {
  const selectable = trialZones.filter(isZoneSelectable);

  if (trialZones.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
        No trial venues are listed right now. Please contact the league desk.
      </p>
    );
  }

  if (selectable.length === 0) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
          Registration is closed for all listed venues right now. Please check back later or contact the league desk.
        </p>
        <div
          className={`trial-venue-picker trial-venue-picker--readonly${hasError ? " trial-venue-picker--error" : ""}`}
          role="list"
          aria-label="Trial venues (registration closed)"
        >
          {trialZones.map((z) => (
            <div key={z.id} className="trial-venue-picker__option trial-venue-picker__option--closed" role="listitem">
              <span className="trial-venue-picker__marker trial-venue-picker__marker--closed" aria-hidden />
              <span className="trial-venue-picker__text">
                {trialZoneSelectLabel(z)}
                <span className="trial-venue-picker__closed-tag">Registration closed</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  let firstSelectableMarked = false;

  return (
    <div
      className={`trial-venue-picker${hasError ? " trial-venue-picker--error" : ""}`}
      role="radiogroup"
      aria-label="Select trial venue"
    >
      {trialZones.map((z) => {
        const selectableZone = isZoneSelectable(z);
        const optionDisabled = disabled || !selectableZone;
        const checked = value === z.id;
        const label = trialZoneSelectLabel(z);
        const markRequired = selectableZone && !firstSelectableMarked;
        if (markRequired) firstSelectableMarked = true;

        if (!selectableZone) {
          return (
            <div
              key={z.id}
              className="trial-venue-picker__option trial-venue-picker__option--closed"
              aria-disabled="true"
            >
              <span className="trial-venue-picker__marker trial-venue-picker__marker--closed" aria-hidden />
              <span className="trial-venue-picker__text">
                {label}
                <span className="trial-venue-picker__closed-tag">Registration closed</span>
              </span>
            </div>
          );
        }

        return (
          <label
            key={z.id}
            className={`trial-venue-picker__option${checked ? " trial-venue-picker__option--checked" : ""}${
              optionDisabled ? " trial-venue-picker__option--disabled" : ""
            }`}
          >
            <input
              type="radio"
              name={name}
              value={z.id}
              checked={checked}
              disabled={optionDisabled}
              required={markRequired && !value}
              className="sr-only"
              onChange={() => onChange(z.id)}
            />
            <span className="trial-venue-picker__marker" aria-hidden />
            <span className="trial-venue-picker__text">{label}</span>
          </label>
        );
      })}
    </div>
  );
}
