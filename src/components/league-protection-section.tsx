import { SectionHeader } from "@/components/section-header";
import { LEAGUE_PROTECTION_BLOCKS } from "@/lib/league-protection";
import { CARD_PAD, SECTION_ACCENT, SITE_CONTAINER } from "@/lib/site-ui";

type Props = {
  compact?: boolean;
};

export function LeagueProtectionSection({ compact = false }: Props) {
  return (
    <section id="league-protection" className={`league-protection ${SECTION_ACCENT}`} aria-labelledby="league-protection-heading">
      <div className={SITE_CONTAINER}>
        <SectionHeader eyebrow="Season 1" title="League protection" align="center" className={compact ? "mb-8" : "mb-10"} />

        <ul className={`league-protection__grid ${compact ? "league-protection__grid--compact" : ""}`}>
          {LEAGUE_PROTECTION_BLOCKS.map((block) => (
            <li key={block.title} className={`league-protection__card ${CARD_PAD}`}>
              <h3 className="league-protection__card-title">{block.title}</h3>
              <p className="league-protection__card-body">{block.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
