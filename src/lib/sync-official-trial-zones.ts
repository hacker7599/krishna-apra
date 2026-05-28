import type { PrismaClient } from "@prisma/client";
import { OFFICIAL_TRIAL_VENUES } from "@/lib/trial-zone-catalog";
import { renumberTrialZoneSortOrders } from "@/lib/trial-zone-sort";

/** Upsert venues from trial-zone-catalog, unpublish extras, renumber sort order. */
export async function syncOfficialTrialZones(
  db: PrismaClient,
): Promise<{ officialCount: number; renumbered: { published: number; hidden: number } }> {
  const ids: string[] = [];
  for (let i = 0; i < OFFICIAL_TRIAL_VENUES.length; i++) {
    const v = OFFICIAL_TRIAL_VENUES[i];
    const existing = await db.trialZone.findFirst({
      where: { trialPlace: v.trialPlace, zone: v.zone },
    });
    const row = existing
      ? await db.trialZone.update({
          where: { id: existing.id },
          data: {
            address: v.address,
            navigationUrl: v.navigationUrl,
            contactDetails: v.contactDetails,
            sortOrder: i,
            published: true,
          },
        })
      : await db.trialZone.create({
          data: {
            trialPlace: v.trialPlace,
            zone: v.zone,
            address: v.address,
            navigationUrl: v.navigationUrl,
            contactDetails: v.contactDetails,
            sortOrder: i,
            published: true,
          },
        });
    ids.push(row.id);
  }

  const officialCount = OFFICIAL_TRIAL_VENUES.length;
  if (ids.length > 0) {
    await db.trialZone.updateMany({
      where: { id: { notIn: ids } },
      data: { published: false },
    });
    const legacy = await db.trialZone.findMany({
      where: { id: { notIn: ids } },
      orderBy: [{ trialPlace: "asc" }, { zone: "asc" }],
    });
    for (let i = 0; i < legacy.length; i++) {
      await db.trialZone.update({
        where: { id: legacy[i].id },
        data: { sortOrder: officialCount + i },
      });
    }
  }

  const renumbered = await renumberTrialZoneSortOrders(db);
  return { officialCount, renumbered };
}
