"use client";

import type { RoleId } from "@/lib/league";
import { ROLE_OPTION_GROUPS, toggleRegistrationRole } from "@/lib/registration-roles";

type Props = {
  roles: Set<RoleId>;
  onChange: (next: Set<RoleId>) => void;
  hasError?: boolean;
  buttonClass?: (on: boolean) => string;
};

const defaultButtonClass = (on: boolean) =>
  `rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
    on ? "border-orange-600 bg-orange-600 text-white" : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
  }`;

export function PlayerRolePicker({ roles, onChange, hasError, buttonClass = defaultButtonClass }: Props) {
  return (
    <fieldset className={hasError ? "rounded-lg ring-2 ring-rose-500/40" : ""}>
      <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-900">Player details (position / role)</legend>
      <div className="space-y-4">
        {ROLE_OPTION_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-800">
              {group.label}
              {"hint" in group && group.hint ? (
                <span className="ml-1.5 font-semibold normal-case text-slate-500">({group.hint})</span>
              ) : null}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.options.map((r) => {
                const on = roles.has(r.id);
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => onChange(toggleRegistrationRole(roles, r.id))}
                    className={buttonClass(on)}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
