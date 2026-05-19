import Link from "next/link";
import { FORMAT } from "@/lib/league";
import { SITE_CONTAINER, SECTION_WHITE } from "@/lib/site-ui";

type Props = {
  teamsStat: number;
};

export function HomeStatsStrip({ teamsStat }: Props) {
  const stats = [
    { k: "Teams", v: teamsStat },
    { k: "Overs", v: FORMAT.overs },
    { k: "Groups", v: FORMAT.groups },
    { k: "League games", v: FORMAT.leagueMatches },
    { k: "Semi-finals", v: FORMAT.semiFinals },
    { k: "Final", v: FORMAT.final },
    { k: "Live cameras", v: FORMAT.cameraLive },
    { k: "Category", v: "U15" },
  ];

  return (
    <section className={`${SECTION_WHITE} !py-0`}>
      <div className={`${SITE_CONTAINER} py-10 sm:py-12`}>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="eyebrow">Season 1 · at a glance</p>
          <Link href="/about" className="text-sm font-bold text-orange-700 underline-offset-2 hover:underline">
            Full story →
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
          <dl className="grid grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-4 sm:divide-y-0 lg:grid-cols-8">
            {stats.map((s) => (
              <div key={s.k} className="px-3 py-6 text-center sm:px-4 sm:py-8">
                <dt className="text-[10px] font-bold uppercase leading-tight tracking-[0.16em] text-orange-700">{s.k}</dt>
                <dd className="mt-2 font-[family-name:var(--font-bebas)] text-3xl leading-none tracking-wide text-slate-900 sm:text-4xl">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
