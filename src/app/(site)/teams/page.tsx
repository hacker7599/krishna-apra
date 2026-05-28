import type { Metadata } from "next";
import Image from "next/image";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { EMPTY_STATE } from "@/lib/site-ui";
import { FORMAT, LEAGUE_NAME, TITLE_SPONSOR } from "@/lib/league";
import { getPublishedTeams } from "@/lib/public-queries";
import { teamLogoPublicUrl } from "@/lib/team-logo-url";

export const dynamic = "force-dynamic";

function teamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

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
          {teams.map((t) => {
            const logoUrl = teamLogoPublicUrl(t.logoPath);
            return (
              <li
                key={t.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="p-5">
                  <div className="mb-4 flex items-center justify-center">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={`${t.name} logo`}
                        width={96}
                        height={96}
                        unoptimized
                        className="h-24 w-24 object-contain"
                      />
                    ) : (
                      <div
                        className="flex h-24 w-24 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-2xl font-bold text-[#1B365D]"
                        aria-hidden
                      >
                        {teamInitials(t.name)}
                      </div>
                    )}
                  </div>
                  <p className="eyebrow text-orange-700">{t.city}</p>
                  <h2 className="mt-1 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-slate-900">{t.name}</h2>
                  <p className="prose-league mt-3 text-sm font-medium">{t.description || "Franchise details coming soon."}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SiteSection>
  );
}
