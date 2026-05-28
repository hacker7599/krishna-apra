import { PrismaClient } from "@prisma/client";
import { OFFICIAL_TRIAL_VENUES } from "../src/lib/trial-zone-catalog";
import { renumberTrialZoneSortOrders } from "../src/lib/trial-zone-sort";

const prisma = new PrismaClient();

async function syncOfficialTrialZones() {
  const ids: string[] = [];
  for (let i = 0; i < OFFICIAL_TRIAL_VENUES.length; i++) {
    const v = OFFICIAL_TRIAL_VENUES[i];
    const existing = await prisma.trialZone.findFirst({
      where: { trialPlace: v.trialPlace, zone: v.zone },
    });

    const row = existing
      ? await prisma.trialZone.update({
          where: { id: existing.id },
          data: {
            address: v.address,
            navigationUrl: v.navigationUrl,
            contactDetails: v.contactDetails,
            sortOrder: i,
            published: true,
          },
        })
      : await prisma.trialZone.create({
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

  if (ids.length > 0) {
    await prisma.trialZone.updateMany({
      where: { id: { notIn: ids } },
      data: { published: false },
    });
  }

  const renumbered = await renumberTrialZoneSortOrders(prisma);
  console.log("Synced official trial zones:", OFFICIAL_TRIAL_VENUES.length, "· renumbered:", renumbered);
}

async function main() {
  await syncOfficialTrialZones();
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });
