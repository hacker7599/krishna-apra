import Image from "next/image";
import Link from "next/link";
import { LEAGUE_NAME, REGION, TAGLINE, TITLE_SPONSOR, VENUE } from "@/lib/league";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <Image src="/branding/logo.png" alt="Future Star U15" fill className="object-cover" sizes="56px" />
          </div>
          <div>
            <p className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-slate-900">{LEAGUE_NAME}</p>
            <p className="mt-1 max-w-sm text-sm font-medium leading-relaxed text-slate-700">{TAGLINE}</p>
            <p className="mt-3 text-xs font-medium text-slate-600">
              Title sponsor: <span className="font-semibold text-orange-700">{TITLE_SPONSOR}</span> · {REGION}
            </p>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-slate-900">Primary venue</p>
          <p className="mt-1 max-w-xs leading-relaxed text-slate-700">{VENUE}</p>
          <div className="mt-4 flex flex-col gap-2 text-xs font-semibold">
            <Link href="/about" className="text-slate-600 hover:text-slate-900">
              About the league
            </Link>
            <Link href="/sponsorship" className="text-slate-600 hover:text-slate-900">
              Sponsorship & partners
            </Link>
            <Link href="/trials" className="text-slate-600 hover:text-slate-900">
              Trial zones and maps
            </Link>
            <Link href="/admin" className="text-slate-500 hover:text-slate-800">
              League admin
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs font-medium text-slate-600">
        Grassroots franchise pathway · Trials · Live match production
      </div>
    </footer>
  );
}
