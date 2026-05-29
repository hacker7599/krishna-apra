import Link from "next/link";
import { FORMAT } from "@/lib/league";
import { SITE_CONTAINER } from "@/lib/site-ui";

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
    <section className="home-stats" aria-labelledby="home-stats-heading">
      <div className={SITE_CONTAINER}>
        <div className="home-stats__head">
          <div>
            <p className="home-stats__eyebrow">Season 1</p>
            <h2 id="home-stats-heading" className="home-stats__title">
              At a glance
            </h2>
          </div>
          <Link href="/about" className="home-stats__link">
            Full story
            <span aria-hidden>→</span>
          </Link>
        </div>
        <dl className="home-stats__grid">
          {stats.map((s) => (
            <div key={s.k} className="home-stats__cell">
              <dt className="home-stats__label">{s.k}</dt>
              <dd className="home-stats__value">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
