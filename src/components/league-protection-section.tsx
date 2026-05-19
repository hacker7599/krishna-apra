import { SectionHeader } from "@/components/section-header";
import { LEAGUE_PROTECTION_BLOCKS } from "@/lib/league-protection";
import { CARD_PAD, SECTION_ACCENT, SITE_CONTAINER } from "@/lib/site-ui";

type Props = {
  compact?: boolean;
};

export function LeagueProtectionSection({ compact = false }: Props) {
  return (
    <section id="league-protection" className={SECTION_ACCENT} aria-labelledby="league-protection-heading">
      <div className={SITE_CONTAINER}>
        <SectionHeader eyebrow="Season 1" title="League protection" align="center" className={compact ? "mb-8" : "mb-10"} />

        <ul className={`grid gap-6 ${compact ? "md:grid-cols-3" : "gap-8 md:grid-cols-3"}`}>
          {LEAGUE_PROTECTION_BLOCKS.map((block) => (
            <li key={block.title} className={CARD_PAD}>
              <h3 className="text-center text-xs font-bold uppercase tracking-[0.16em] text-orange-700">{block.title}</h3>
              <p className="prose-league mt-4 text-center text-sm font-medium">{block.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
