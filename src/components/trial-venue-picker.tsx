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

/** Radio cards — easier to scan than a long native &lt;select&gt;. */
export function TrialVenuePicker({ trialZones, value, onChange, hasError, disabled, name = "trialZoneId" }: Props) {
  if (trialZones.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
        No trial venues are available right now. Please contact the league desk.
      </p>
    );
  }

  return (
    <div
      className={`trial-venue-picker${hasError ? " trial-venue-picker--error" : ""}`}
      role="radiogroup"
      aria-label="Select trial venue"
    >
      {trialZones.map((z) => {
        const checked = value === z.id;
        const label = trialZoneSelectLabel(z);
        return (
          <label
            key={z.id}
            className={`trial-venue-picker__option${checked ? " trial-venue-picker__option--checked" : ""}${
              disabled ? " trial-venue-picker__option--disabled" : ""
            }`}
          >
            <input
              type="radio"
              name={name}
              value={z.id}
              checked={checked}
              disabled={disabled}
              required={!value}
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
