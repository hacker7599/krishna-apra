import type { Metadata } from "next";
import Link from "next/link";
import { SitePublicPage } from "@/components/site/site-public-page";
import { EMPTY_STATE } from "@/lib/site-ui";
import { SupportContactLinks } from "@/components/support-contact-links";
import { LEAGUE_NAME, REGION, SEASON_START } from "@/lib/league";
import { getPublishedTrialSchedules } from "@/lib/public-queries";
import {
  calendarDayIst,
  formatTrialScheduleDateRange,
  formatTrialScheduleRange,
} from "@/lib/trial-schedule-datetime";
import { parseScheduleVenueNote } from "@/lib/official-trial-schedule-catalog";
import { trialVenueDisplayLabel } from "@/lib/trial-zone-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Trial schedule · ${LEAGUE_NAME}`,
  description: `Official trial dates and venues for ${LEAGUE_NAME}. Trials ${SEASON_START}.`,
};

function sortScheduleEntries<T extends { scheduledAt: Date }>(entries: T[]): T[] {
  const now = new Date();
  return [...entries].sort((a, b) => {
    const aDone = calendarDayIst(now) > calendarDayIst(a.scheduledAt);
    const bDone = calendarDayIst(now) > calendarDayIst(b.scheduledAt);
    if (aDone !== bDone) return aDone ? 1 : -1;
    return a.scheduledAt.getTime() - b.scheduledAt.getTime();
  });
}

export default async function SchedulePage() {
  const schedule = sortScheduleEntries(await getPublishedTrialSchedules());
  const now = new Date();

  return (
    <SitePublicPage
      pageClassName="page-schedule"
      eyebrow={`${REGION} · ${SEASON_START}`}
      title="Trial schedule"
      lead="Season trial dates, reporting times, and venues. Register online once you have chosen your slot."
      breadcrumb={[{ label: "Schedule" }]}
      heroChildren={
        <div className="site-page-actions">
          <Link href="/register" className="site-hero__btn site-hero__btn--primary">
            Register for trials
          </Link>
          <Link href="/trials" className="site-hero__btn site-hero__btn--ghost">
            Trial zones
          </Link>
        </div>
      }
    >
      {schedule.length === 0 ? (
        <p className={EMPTY_STATE}>
          The trial schedule will be published here soon. For help, contact <SupportContactLinks linkClassName="font-bold text-orange-700 underline" />.
        </p>
      ) : (
        <ol className="schedule-list">
          {schedule.map((entry, index) => {
            const isDone = calendarDayIst(now) > calendarDayIst(entry.scheduledAt);
            const seededVenue = parseScheduleVenueNote(entry.notes);
            const venueLabel = entry.trialZone
              ? trialVenueDisplayLabel(entry.trialZone)
              : seededVenue
                ? `${seededVenue.trialPlace} - ${seededVenue.zone}`
                : null;
            return (
              <li
                key={entry.id}
                className={`schedule-list__item${isDone ? " schedule-list__item--done" : ""}`}
              >
                {isDone ? (
                  <span className="schedule-list__watermark" aria-hidden>
                    Trial done
                  </span>
                ) : null}
                <div className="schedule-list__index" aria-hidden>
                  {index + 1}
                </div>
                <div className="schedule-list__body">
                  <p className="schedule-list__date">{formatTrialScheduleDateRange(entry.scheduledAt, entry.endAt)}</p>
                  <h2 className="schedule-list__title">{entry.title}</h2>
                  <p className="schedule-list__time">{formatTrialScheduleRange(entry.scheduledAt, entry.endAt)}</p>
                  {venueLabel ? (
                    <div className="schedule-list__venue">
                      <p className="schedule-list__venue-label">Venue</p>
                      <p className="schedule-list__venue-name">{venueLabel}</p>
                      {entry.trialZone?.address ? (
                        <p className="schedule-list__venue-address">{entry.trialZone.address}</p>
                      ) : null}
                      {entry.trialZone?.navigationUrl ? (
                        <a
                          href={entry.trialZone.navigationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="schedule-list__maps"
                        >
                          Open in Google Maps
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                  {entry.notes && !seededVenue ? <p className="schedule-list__notes">{entry.notes}</p> : null}
                  {entry.notes && seededVenue ? (
                    <p className="schedule-list__notes">
                      {entry.notes
                        .split("\n")
                        .filter((line) => !line.startsWith("VENUE:"))
                        .join("\n")
                        .trim()}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </SitePublicPage>
  );
}
