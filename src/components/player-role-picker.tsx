"use client";

import type { RoleId } from "@/lib/league";
import {
  PLAYER_ROLE_ALL_ROUNDER,
  PLAYER_ROLE_BATTER,
  PLAYER_ROLE_BOWLER,
  PLAYER_ROLE_WICKETKEEPER,
  toggleRegistrationRole,
} from "@/lib/registration-roles";

type Props = {
  roles: Set<RoleId>;
  onChange: (next: Set<RoleId>) => void;
  hasError?: boolean;
  disabled?: boolean;
};

function RoleCheckbox({
  label,
  checked,
  onToggle,
  disabled,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <label className={`player-role-check${disabled ? " is-disabled" : ""}`}>
      <input type="checkbox" disabled={disabled} checked={checked} onChange={onToggle} />
      <span className="player-role-check__label">{label}</span>
    </label>
  );
}

function RoleBlock({
  letter,
  title,
  sideLabel,
  sideChecked,
  onSideToggle,
  children,
  disabled,
}: {
  letter: string;
  title: string;
  sideLabel: string;
  sideChecked: boolean;
  onSideToggle: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="player-role-panel__block">
      <p className="player-role-panel__heading">
        <span className="player-role-panel__letter">{letter})</span> {title} :
      </p>
      <div className="player-role-panel__side">
        <RoleCheckbox label={sideLabel} checked={sideChecked} onToggle={onSideToggle} disabled={disabled} />
      </div>
      <div className="player-role-panel__options">{children}</div>
    </div>
  );
}

export function PlayerRolePicker({ roles, onChange, hasError, disabled }: Props) {
  function toggle(id: RoleId) {
    if (disabled) return;
    onChange(toggleRegistrationRole(roles, id));
  }

  return (
    <div className={`player-role-panel${hasError ? " player-role-panel--error" : ""}`} role="group" aria-labelledby="player-roles-heading">
      <p id="player-roles-heading" className="sr-only">
        Player details
      </p>
      <p className="player-role-panel__hint">Tick all that apply (one under Batter and one under Bowler if selected).</p>

      <RoleBlock
        letter={PLAYER_ROLE_BATTER.letter}
        title={PLAYER_ROLE_BATTER.label}
        sideLabel={PLAYER_ROLE_ALL_ROUNDER.label}
        sideChecked={roles.has(PLAYER_ROLE_ALL_ROUNDER.id)}
        onSideToggle={() => toggle(PLAYER_ROLE_ALL_ROUNDER.id)}
        disabled={disabled}
      >
        {PLAYER_ROLE_BATTER.options.map((r) => (
          <RoleCheckbox key={r.id} label={r.label} checked={roles.has(r.id)} onToggle={() => toggle(r.id)} disabled={disabled} />
        ))}
      </RoleBlock>

      <RoleBlock
        letter={PLAYER_ROLE_BOWLER.letter}
        title={PLAYER_ROLE_BOWLER.label}
        sideLabel={PLAYER_ROLE_WICKETKEEPER.label}
        sideChecked={roles.has(PLAYER_ROLE_WICKETKEEPER.id)}
        onSideToggle={() => toggle(PLAYER_ROLE_WICKETKEEPER.id)}
        disabled={disabled}
      >
        {PLAYER_ROLE_BOWLER.options.map((r) => (
          <RoleCheckbox key={r.id} label={r.label} checked={roles.has(r.id)} onToggle={() => toggle(r.id)} disabled={disabled} />
        ))}
      </RoleBlock>
    </div>
  );
}
