import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { NavLink } from "@/components/nav-link";
import { TitleSponsorMark } from "@/components/title-sponsor-mark";
import { SITE_PRIMARY_NAV } from "@/lib/site-navigation";
import { BTN_PRIMARY, SITE_CONTAINER } from "@/lib/site-ui";
import { LEAGUE_LOGO_SRC } from "@/lib/branding";
import { LEAGUE_NAME, LEAGUE_SUBTITLE } from "@/lib/league";

export function SiteHeader() {
  return (
    <header className="site-header print:hidden">
      <div className="tricolor-stripe" aria-hidden />
      <div className={`${SITE_CONTAINER} site-header__inner`}>
        <Link href="/" className="site-header__brand">
          <span className="site-header__logo">
            <Image src={LEAGUE_LOGO_SRC} alt="Future Star U15" fill className="object-cover" sizes="44px" priority />
          </span>
          <span className="min-w-0">
            <span className="site-header__name">{LEAGUE_NAME}</span>
            <span className="site-header__tag line-clamp-1" title={LEAGUE_SUBTITLE}>
              {LEAGUE_SUBTITLE}
            </span>
          </span>
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          {SITE_PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              exact={item.exact}
              highlight={item.highlight}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <TitleSponsorMark size="sm" className="hidden xl:flex" />
          <Link href="/register" className={`${BTN_PRIMARY} hidden sm:inline-flex !px-5`}>
            Register
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
