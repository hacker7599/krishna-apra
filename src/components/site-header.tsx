import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { NavLink } from "@/components/nav-link";
import { TitleSponsorMark } from "@/components/title-sponsor-mark";
import { BTN_PRIMARY, SITE_CONTAINER } from "@/lib/site-ui";
import { LEAGUE_LOGO_SRC } from "@/lib/branding";
import { LEAGUE_NAME, LEAGUE_SUBTITLE } from "@/lib/league";

const links = [
  { href: "/", label: "Home", exact: true },
  { href: "/about", label: "About" },
  { href: "/sponsorship", label: "Partners" },
  { href: "/teams", label: "Teams" },
  { href: "/schedule", label: "Schedule" },
  { href: "/trials", label: "Trial zones" },
  { href: "/blog", label: "Blog" },
  { href: "/register", label: "Join" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 header-surface print:hidden">
      <div className="tricolor-stripe" aria-hidden />
      <div className={`${SITE_CONTAINER} flex items-center justify-between gap-4 py-3`}>
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition group-hover:border-orange-200">
            <Image src={LEAGUE_LOGO_SRC} alt="Future Star U15" fill className="object-cover" sizes="44px" priority />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block font-[family-name:var(--font-bebas)] text-lg tracking-wide text-[#0c1f3d] transition group-hover:text-orange-700 sm:text-xl">
              {LEAGUE_NAME}
            </span>
            <span className="mt-0.5 hidden text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:block sm:text-[11px]" title={LEAGUE_SUBTITLE}>
              <span className="line-clamp-1">{LEAGUE_SUBTITLE}</span>
            </span>
          </span>
        </Link>

        <nav className="hidden items-center lg:flex" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} exact={"exact" in l ? l.exact : false}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <TitleSponsorMark size="sm" className="hidden lg:flex" />
          <Link href="/register" className={`${BTN_PRIMARY} hidden sm:inline-flex !px-5`}>
            Register
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
