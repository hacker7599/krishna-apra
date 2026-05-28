import { prisma } from "@/lib/prisma";
import { sanitizeBannerCtaHrefForPublic, sanitizeTrialZoneNavUrl } from "@/lib/safe-public-href";

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
