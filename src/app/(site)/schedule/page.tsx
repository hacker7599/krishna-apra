import type { Metadata } from "next";
import Link from "next/link";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { BTN_PRIMARY, CARD_PAD, EMPTY_STATE } from "@/lib/site-ui";
import { SupportContactLinks } from "@/components/support-contact-links";
import { LEAGUE_NAME, SEASON_START } from "@/lib/league";
import { getPublishedTrialSchedules } from "@/lib/public-queries";
import { formatTrialScheduleDate, formatTrialScheduleRange } from "@/lib/trial-schedule-datetime";
import { trialVenueDisplayLabel } from "@/lib/trial-zone-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Trial schedule · ${LEAGUE_NAME}`,
  description: `Official trial dates and venues for ${LEAGUE_NAME}. Season starts ${SEASON_START}.`,
};

export default async function SchedulePage() {
  const schedule = await getPublishedTrialSchedules();

  return (
    <SiteSection width="content" tone="white">
      <SitePageHero
        title="Trial schedule"
        lead={`Season trials begin ${SEASON_START}. Check dates, reporting times, and venues below. Register online once you have chosen your slot.`}
        breadcrumb={[{ label: "Schedule" }]}
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/register" className={BTN_PRIMARY}>
          Register for trials
        </Link>
        <Link href="/trials" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          View trial zones
        </Link>
      </div>

      {schedule.length === 0 ? (
        <p className={`mt-10 ${EMPTY_STATE}`}>
          The trial schedule will be published here soon. For help, contact <SupportContactLinks linkClassName="font-bold text-orange-700 underline" />.
        </p>
      ) : (
        <ol className="mt-10 space-y-6">
          {schedule.map((entry, index) => (
            <li key={entry.id} className={`${CARD_PAD} relative overflow-hidden`}>
              <div className="absolute left-0 top-0 h-full w-1 bg-orange-500" aria-hidden />
              <div className="flex flex-wrap items-start gap-4 pl-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1B365D] font-[family-name:var(--font-bebas)] text-2xl text-white">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
                    {formatTrialScheduleDate(entry.scheduledAt)}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{entry.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formatTrialScheduleRange(entry.scheduledAt, entry.endAt)}
                  </p>
                  {entry.trialZone ? (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase text-slate-500">Venue</p>
                      <p className="mt-1 font-bold text-slate-900">{trialVenueDisplayLabel(entry.trialZone)}</p>
                      <p className="mt-1 text-sm text-slate-600">{entry.trialZone.address}</p>
                      {entry.trialZone.navigationUrl ? (
                        <a
                          href={entry.trialZone.navigationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-sm font-bold text-orange-700 underline"
                        >
                          Open in Google Maps
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                  {entry.notes ? (
                    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{entry.notes}</p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SiteSection>
  );
}
