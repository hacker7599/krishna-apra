import { OfflineFormSection, OfflinePrintCheckbox } from "@/components/offline-form-primitives";
import {
  PLAYER_ROLE_ALL_ROUNDER,
  PLAYER_ROLE_BATTER,
  PLAYER_ROLE_BOWLER,
  PLAYER_ROLE_WICKETKEEPER,
} from "@/lib/registration-roles";

function RoleBlock({
  letter,
  title,
  sideLabel,
  children,
}: {
  letter: string;
  title: string;
  sideLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="offline-role-block">
      <p className="offline-role-block__heading">
        <span className="offline-role-block__letter">{letter})</span> {title} :
      </p>
      <div className="offline-role-block__side">
        <OfflinePrintCheckbox label={sideLabel} />
      </div>
      <div className="offline-role-block__opts">{children}</div>
    </div>
  );
}

export function OfflinePlayerRoleFields() {
  return (
    <OfflineFormSection number="5" title="Player details" boxed>
      <RoleBlock letter={PLAYER_ROLE_BATTER.letter} title={PLAYER_ROLE_BATTER.label} sideLabel={PLAYER_ROLE_ALL_ROUNDER.label}>
        {PLAYER_ROLE_BATTER.options.map((r) => (
          <OfflinePrintCheckbox key={r.id} label={r.label} />
        ))}
      </RoleBlock>
      <RoleBlock letter={PLAYER_ROLE_BOWLER.letter} title={PLAYER_ROLE_BOWLER.label} sideLabel={PLAYER_ROLE_WICKETKEEPER.label}>
        {PLAYER_ROLE_BOWLER.options.map((r) => (
          <OfflinePrintCheckbox key={r.id} label={r.label} />
        ))}
      </RoleBlock>
    </OfflineFormSection>
  );
}
