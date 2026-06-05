import { PrismaClient } from "@prisma/client";
import { syncOfficialTrialSchedule } from "../src/lib/sync-official-trial-schedule";

const prisma = new PrismaClient();

async function main() {
  const result = await syncOfficialTrialSchedule(prisma);
  console.log(
    "Synced official trial schedule:",
    result.officialCount,
    "entries",
    result.linkedZones > 0 ? `(${result.linkedZones} linked to trial zones)` : "",
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
