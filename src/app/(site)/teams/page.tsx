import type { Metadata } from "next";
import Image from "next/image";
import { SitePublicPage } from "@/components/site/site-public-page";
import { EMPTY_STATE } from "@/lib/site-ui";
import { FORMAT, LEAGUE_NAME, REGION, TITLE_SPONSOR } from "@/lib/league";
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
  const count = teams.length || FORMAT.teams;

  return (
    <SitePublicPage
      pageClassName="page-teams"
      eyebrow={`${REGION} · Season 1`}
      title={`${count} Delhi NCR teams`}
      lead="Two groups, round-robin energy, and knockout drama—each franchise is crafted to give young squads a club identity they can rally behind."
      breadcrumb={[{ label: "Teams" }]}
    >
      {teams.length === 0 ? (
        <p className={EMPTY_STATE}>No teams published yet. Add teams in the admin panel.</p>
      ) : (
        <ul className="teams-grid">
          {teams.map((t) => {
            const logoUrl = teamLogoPublicUrl(t.logoPath);
            return (
              <li key={t.id} className="teams-grid__card">
                <div className="teams-grid__logo">
                  {logoUrl ? (
                    <Image src={logoUrl} alt={`${t.name} logo`} width={96} height={96} unoptimized className="teams-grid__logo-img" />
                  ) : (
                    <div className="teams-grid__logo-fallback" aria-hidden>
                      {teamInitials(t.name)}
                    </div>
                  )}
                </div>
                <p className="teams-grid__city">{t.city}</p>
                <h2 className="teams-grid__name">{t.name}</h2>
                <p className="teams-grid__desc">{t.description || "Franchise details coming soon."}</p>
              </li>
            );
          })}
        </ul>
      )}
    </SitePublicPage>
  );
}
