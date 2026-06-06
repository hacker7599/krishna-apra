import { prisma } from "@/lib/prisma";
import { sanitizeBannerCtaHrefForPublic, sanitizeTrialZoneNavUrl } from "@/lib/safe-public-href";
import { attachTrialZoneRegistrationOpen } from "@/lib/trial-zone-registration-open";

export function getPublishedTeams() {
  return prisma.team.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
}

export function getPublishedTeamCount() {
  return prisma.team.count({ where: { published: true } });
}

export async function getPublishedBanners() {
  const rows = await prisma.heroBanner.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    ...r,
    ctaHref: sanitizeBannerCtaHrefForPublic(r.ctaHref),
  }));
}

export async function getPublishedTrialZones() {
  const rows = await prisma.trialZone.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    ...r,
    navigationUrl: sanitizeTrialZoneNavUrl(r.navigationUrl),
  }));
}

export async function getPublishedTrialZoneOptions() {
  const rows = await prisma.trialZone.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, trialPlace: true, zone: true },
  });
  return rows;
}

/** All published zones for registration UI (open + closed). Closed zones are shown disabled. */
export async function getRegistrationTrialZonePickerOptions() {
  const rows = await prisma.trialZone.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, trialPlace: true, zone: true },
  });
  const enriched = await attachTrialZoneRegistrationOpen(rows);
  return enriched.map((z) => ({
    id: z.id,
    trialPlace: z.trialPlace,
    zone: z.zone,
    registrationOpen: z.registrationOpen,
  }));
}

/** Zones accepting new sign-ups (server validation). */
export async function getRegistrationTrialZoneOptions() {
  const zones = await getRegistrationTrialZonePickerOptions();
  return zones
    .filter((z) => z.registrationOpen !== false)
    .map(({ id, trialPlace, zone }) => ({ id, trialPlace, zone }));
}

export async function getPublishedTrialSchedules() {
  return prisma.trialSchedule.findMany({
    where: { published: true },
    orderBy: [{ scheduledAt: "asc" }, { sortOrder: "asc" }],
    include: {
      trialZone: {
        select: {
          id: true,
          trialPlace: true,
          zone: true,
          address: true,
          navigationUrl: true,
        },
      },
    },
  });
}
