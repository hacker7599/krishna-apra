import type { PrismaClient } from "@prisma/client";
import {
  buildScheduleEntryNotes,
  officialVenueKey,
  OFFICIAL_TRIAL_END_TIME,
  OFFICIAL_TRIAL_REPORT_TIME,
  OFFICIAL_TRIAL_SCHEDULE_DAYS,
  scheduleEntryTitle,
  SCHEDULE_TRIAL_ZONE_LINKS,
  type OfficialTrialVenueKey,
} from "@/lib/official-trial-schedule-catalog";
import { combineDateAndTimeIst } from "@/lib/trial-schedule-datetime";

function dayBoundsIst(date: string) {
  return {
    gte: new Date(`${date}T00:00:00+05:30`),
    lte: new Date(`${date}T23:59:59.999+05:30`),
  };
}

async function resolveTrialZoneId(db: PrismaClient, venue: OfficialTrialVenueKey) {
  const link = SCHEDULE_TRIAL_ZONE_LINKS[officialVenueKey(venue)] ?? venue;
  const zone = await db.trialZone.findFirst({
    where: { trialPlace: link.trialPlace, zone: link.zone },
    select: { id: true },
  });
  return zone?.id ?? null;
}

/** Upsert one schedule row per printed-schedule venue; unpublish stale seeded rows. */
export async function syncOfficialTrialSchedule(
  db: PrismaClient,
): Promise<{ officialCount: number; linkedZones: number }> {
  const ids: string[] = [];
  let linkedZones = 0;

  for (const day of OFFICIAL_TRIAL_SCHEDULE_DAYS) {
    for (let vi = 0; vi < day.venues.length; vi++) {
      const venue = day.venues[vi]!;
      const scheduledAt = new Date(combineDateAndTimeIst(day.date, OFFICIAL_TRIAL_REPORT_TIME));
      const endAt = new Date(combineDateAndTimeIst(day.date, OFFICIAL_TRIAL_END_TIME));
      const title = scheduleEntryTitle(day, venue);
      const sortOrder = day.day * 100 + vi;
      const notes = buildScheduleEntryNotes(venue);
      const trialZoneId = await resolveTrialZoneId(db, venue);
      if (trialZoneId) linkedZones += 1;

      const existing = await db.trialSchedule.findFirst({
        where: {
          scheduledAt: dayBoundsIst(day.date),
          title,
        },
      });

      const row = existing
        ? await db.trialSchedule.update({
            where: { id: existing.id },
            data: {
              scheduledAt,
              endAt,
              notes,
              sortOrder,
              published: true,
              trialZoneId,
            },
          })
        : await db.trialSchedule.create({
            data: {
              title,
              scheduledAt,
              endAt,
              notes,
              sortOrder,
              published: true,
              trialZoneId,
            },
          });

      ids.push(row.id);
    }
  }

  if (ids.length > 0) {
    await db.trialSchedule.updateMany({
      where: { id: { notIn: ids } },
      data: { published: false },
    });
  }

  return { officialCount: ids.length, linkedZones };
}
