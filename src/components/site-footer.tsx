import Image from "next/image";
import Link from "next/link";
import { COPYRIGHT_HOLDER, LEGAL_ENTITY } from "@/lib/site-legal";
import { TitleSponsorMark } from "@/components/title-sponsor-mark";
import { LEAGUE_LOGO_SRC } from "@/lib/branding";
import { SocialMediaLinks } from "@/components/social-media-links";
import { SITE_FOOTER_EXPLORE, SITE_FOOTER_LEGAL } from "@/lib/site-navigation";
import { SITE_CONTAINER } from "@/lib/site-ui";
import { LEAGUE_NAME, REGISTRATION_SUPPORT_PHONES, REGION, TAGLINE, VENUE } from "@/lib/league";

function LinkColumn({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm font-medium text-slate-700 transition hover:text-orange-700">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-700 print:hidden">
      <div className="site-container py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <div className="flex gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <Image src={LEAGUE_LOGO_SRC} alt="" fill className="object-cover" sizes="48px" />
              </div>
              <div>
                <p className="font-[family-name:var(--font-bebas)] text-xl tracking-wide text-slate-900">{LEAGUE_NAME}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">Under-15 · {REGION}</p>
              </div>
            </div>
            <p className="prose-league-muted mt-4 max-w-xs text-sm">{TAGLINE}</p>
            <TitleSponsorMark size="sm" align="start" className="mt-4" />
            <div className="mt-5">
              <p className="eyebrow">Follow us</p>
              <SocialMediaLinks className="mt-3" />
            </div>
          </div>

          <LinkColumn title="Explore" links={SITE_FOOTER_EXPLORE} />
          <LinkColumn title="Legal" links={SITE_FOOTER_LEGAL} />

          <div>
            <p className="eyebrow">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm font-medium">
              <li>
                <a href={`mailto:${LEGAL_ENTITY.contactEmail}`} className="text-slate-700 hover:text-orange-700">
                  {LEGAL_ENTITY.contactEmail}
                </a>
              </li>
              {REGISTRATION_SUPPORT_PHONES.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone}`} className="text-slate-700 hover:text-orange-700">
                    {phone}
                  </a>
                </li>
              ))}
              <li className="pt-2 text-xs leading-relaxed text-slate-500">{VENUE}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-8">
          <div className="flex flex-col gap-4 text-xs font-medium leading-relaxed text-slate-500 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-1">
              <p>
                <span className="font-semibold text-slate-700">{LEGAL_ENTITY.legalName}</span>
              </p>
              <p>{LEGAL_ENTITY.registeredAddress}</p>
            </div>
            <p className="shrink-0">© {year} {COPYRIGHT_HOLDER}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
