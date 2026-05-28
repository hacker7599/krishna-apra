import { PrismaClient } from "@prisma/client";
import { syncOfficialTrialZones } from "../src/lib/sync-official-trial-zones";

const prisma = new PrismaClient();

async function main() {
  const result = await syncOfficialTrialZones(prisma);
  console.log(
    "Synced official trial zones:",
    result.officialCount,
    "· renumbered published/hidden:",
    result.renumbered.published,
    "/",
    result.renumbered.hidden,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });
