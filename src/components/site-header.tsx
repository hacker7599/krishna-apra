import Image from "next/image";
import Link from "next/link";
import { LEAGUE_NAME, LEAGUE_SUBTITLE, TITLE_SPONSOR } from "@/lib/league";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/sponsorship", label: "Partners" },
  { href: "/teams", label: "Teams" },
  { href: "/trials", label: "Trials" },
  { href: "/register", label: "Join" },
];

const navLinkClass =
  "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 hover:text-slate-950";

const btnPrimaryClass =
  "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg bg-orange-600 px-4 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-orange-700";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 header-surface print:hidden">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 sm:px-6 md:grid-cols-[minmax(0,auto)_1fr_auto] md:gap-4 md:py-3.5">
        <Link href="/" className="group flex min-w-0 max-w-full items-center gap-3 justify-self-start md:max-w-[min(100%,18rem)] lg:max-w-[min(100%,22rem)]">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:h-12 sm:w-12">
            <Image src="/branding/logo.png" alt="Future Star U15" fill className="object-cover" sizes="48px" priority />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block font-[family-name:var(--font-bebas)] text-lg tracking-wide text-slate-900 sm:text-xl">
              {LEAGUE_NAME}
            </span>
            <span
              className="mt-0.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 sm:text-xs"
              title={LEAGUE_SUBTITLE}
            >
              <span className="line-clamp-2 sm:line-clamp-none">{LEAGUE_SUBTITLE}</span>
            </span>
          </span>
        </Link>

        <nav className="hidden items-center justify-center justify-self-center gap-0.5 md:flex lg:gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={navLinkClass}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3 justify-self-end">
          <div
            className="hidden h-10 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-center leading-tight lg:flex lg:min-w-0 lg:max-w-[10.5rem]"
            title={`Title sponsor · ${TITLE_SPONSOR}`}
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Sponsor</span>
            <span className="truncate text-xs font-bold text-slate-900">{TITLE_SPONSOR}</span>
          </div>
          <Link href="/register" className={btnPrimaryClass}>
            Register
          </Link>
        </div>
      </div>

      <nav className="border-t border-slate-100 bg-slate-50/90 md:hidden" aria-label="Primary">
        <div className="mx-auto flex max-w-6xl justify-between gap-1 overflow-x-auto px-3 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex h-9 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg px-1.5 text-xs font-semibold text-slate-800 transition hover:bg-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
