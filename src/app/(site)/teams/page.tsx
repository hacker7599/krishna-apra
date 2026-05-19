import type { Metadata } from "next";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { EMPTY_STATE } from "@/lib/site-ui";
import { FORMAT, LEAGUE_NAME, TITLE_SPONSOR } from "@/lib/league";
import { getPublishedTeams } from "@/lib/public-queries";

export async function generateMetadata(): Promise<Metadata> {
  const teams = await getPublishedTeams();
  const n = teams.length || FORMAT.teams;
  return {
    title: `${n} Teams · ${LEAGUE_NAME}`,
    description: `Franchise line-up for the ${TITLE_SPONSOR} title–backed Future Star Under-15 league in Delhi NCR.`,
  };
}

export default async function TeamsPage() {
  const teams = await getPublishedTeams();

  return (
    <SiteSection width="content" tone="white">
      <SitePageHero
        title={`${teams.length || FORMAT.teams} Delhi NCR teams`}
        lead="Two groups, round-robin energy, and knockout drama—each franchise is crafted to give young squads a club identity they can rally behind."
        breadcrumb={[{ label: "Teams" }]}
      />

      {teams.length === 0 ? (
        <p className={`mt-10 ${EMPTY_STATE}`}>No teams published yet. Add teams in the admin panel.</p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((t, i) => (
            <li
              key={t.id}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="h-1.5 w-full" style={{ backgroundColor: t.accentColor }} aria-hidden />
              <div className="p-5">
              <span
                className="mb-3 inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-2 text-sm font-bold text-white shadow-sm"
                style={{ backgroundColor: t.accentColor }}
              >
                {i + 1}
              </span>
              <p className="eyebrow text-orange-700">{t.city}</p>
              <h2 className="mt-1 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-slate-900">{t.name}</h2>
              <p className="prose-league mt-3 text-sm font-medium">{t.description || "Franchise details coming soon."}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SiteSection>
  );
}
