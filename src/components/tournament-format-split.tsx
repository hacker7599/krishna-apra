import Image from "next/image";
import Link from "next/link";
import { FORMAT } from "@/lib/league";
import { cricketTeamGame } from "@/lib/remote-images";
import { SITE_CONTAINER } from "@/lib/site-ui";

function formatStatLines() {
  const t = FORMAT.teams;
  return [
    `${String(t).padStart(2, "0")} TEAMS`,
    `${FORMAT.groups} GROUPS`,
    `${FORMAT.leagueMatches} MATCHES`,
    `${FORMAT.semiFinals} SEMI FINAL`,
    `${FORMAT.final} FINAL`,
    `T${FORMAT.overs} FORMAT`,
    "U15 CATEGORY",
    `${FORMAT.cameraLive} CAMERA LIVE`,
  ];
}

type Props = {
  imagePriority?: boolean;
  showAboutLink?: boolean;
};

export function TournamentFormatSplit({ imagePriority = false, showAboutLink = false }: Props) {
  const lines = formatStatLines();
  const img = cricketTeamGame(1200);

  return (
    <section className="format-split" aria-labelledby="format-split-heading">
      <div className={SITE_CONTAINER}>
        <div className="format-split__panel">
          <div className="format-split__copy">
            <p className="format-split__eyebrow">Season 1</p>
            <h2 id="format-split-heading" className="format-split__title">
              Tournament
              <span className="format-split__title-accent">Format</span>
            </h2>
            <div className="format-split__image-wrap">
              <Image
                src={img}
                alt="Young cricketer in match action"
                fill
                className="object-cover object-top"
                sizes="(max-width:768px) 100vw, 50vw"
                priority={imagePriority}
              />
            </div>
          </div>
          <div className="format-split__stats">
            <ul className="format-split__list" aria-label="Tournament format summary">
              {lines.map((line) => (
                <li key={line} className="format-split__line">
                  {line}
                </li>
              ))}
            </ul>
            {showAboutLink && (
              <p className="format-split__about">
                <Link href="/about" className="format-split__about-link">
                  About the league
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
