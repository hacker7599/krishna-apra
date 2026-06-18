import Link from "next/link";
import Image from "next/image";
import { RegisterCtaLink } from "@/components/register-cta-link";
import { TitleSponsorMark } from "@/components/title-sponsor-mark";
import { BTN_SECONDARY, SITE_CONTAINER } from "@/lib/site-ui";
import { LEAGUE_LOGO_SRC } from "@/lib/branding";
import { LEAGUE_INITIATIVE_BY, LEAGUE_NAME, REGION, TAGLINE } from "@/lib/league";
import { cricketMatchWide, cricketTeamGame } from "@/lib/remote-images";

type Props = {
  teamsStat: number;
};

export function HomeIntroBand({ teamsStat }: Props) {
  const imgA = cricketMatchWide(880);
  const imgB = cricketTeamGame(880);

  return (
    <section className="home-intro" aria-labelledby="home-intro-heading">
      <div className={`${SITE_CONTAINER} home-intro__grid`}>
        <div className="home-intro__copy">
          <p className="home-intro__initiative">
            An initiative by <span>{LEAGUE_INITIATIVE_BY}</span>
          </p>
          <TitleSponsorMark size="xl" align="start" priority />
          <p className="home-intro__eyebrow">{REGION} · Season 1</p>
          <h2 id="home-intro-heading" className="home-intro__title">
            {LEAGUE_NAME}
            <span className="home-intro__title-accent">Under-15 Championship</span>
          </h2>
          <p className="home-intro__tagline">{TAGLINE}</p>
          <p className="home-intro__body">
            A Delhi NCR junior league blending grassroots discovery with franchise spectacle—trials, team builds, and
            match days designed for school-age cricketers to shine on camera and on the scoreboard.
          </p>
          <div className="home-intro__actions">
            <RegisterCtaLink className="inline-flex" />
            <Link href="/teams" className={BTN_SECONDARY}>
              Meet the {teamsStat} teams
            </Link>
          </div>
        </div>

        <aside className="home-intro__visual" aria-label="League imagery">
          <div className="home-intro__logo-frame">
            <Image src={LEAGUE_LOGO_SRC} alt="Future Star U15 league logo" fill className="object-cover" sizes="280px" priority />
          </div>
          <div className="home-intro__photo-grid">
            <figure className="home-intro__photo">
              <Image src={imgA} alt="Cricket match in a stadium" fill className="object-cover" sizes="200px" />
            </figure>
            <figure className="home-intro__photo">
              <Image src={imgB} alt="Cricket on a green field" fill className="object-cover" sizes="200px" />
            </figure>
          </div>
        </aside>
      </div>
    </section>
  );
}
