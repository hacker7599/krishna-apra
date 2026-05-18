import Image from "next/image";
import type { Metadata } from "next";
import { cricketMatchWide } from "@/lib/remote-images";
import { FORMAT, LEAGUE_NAME, TITLE_SPONSOR } from "@/lib/league";
import { getPublishedTeams } from "@/lib/public-queries";

const banner = cricketMatchWide(1600);

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
    <div>
      <div className="relative h-48 w-full overflow-hidden border-b border-slate-200 sm:h-56">
        <Image src={banner} alt="Cricket match on a green field" fill className="object-cover object-center" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/25 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-4 pb-8 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-200">Franchise roster</p>
          <h1 className="mt-1 font-[family-name:var(--font-barlow)] text-4xl font-bold italic tracking-tight text-white drop-shadow-sm sm:text-5xl">
            {teams.length} Delhi NCR teams
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-700">
          Two groups, round-robin energy, and knockout drama—each franchise is crafted to give young squads a club identity they can rally behind.
        </p>

        {teams.length === 0 ? (
          <p className="mt-10 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-600">
            No teams published yet. Add teams in the admin panel.
          </p>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teams.map((t, i) => (
              <li key={t.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <span
                  className="mb-3 inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-2 text-sm font-bold text-white"
                  style={{ backgroundColor: t.accentColor }}
                >
                  {i + 1}
                </span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{t.city}</p>
                <h2 className="mt-1 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-slate-900">{t.name}</h2>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700">{t.description || "Franchise details coming soon."}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
