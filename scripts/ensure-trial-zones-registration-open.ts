/**
 * Re-opens registration on all trial zones (safe fix if zones were accidentally closed).
 * Run: npm run db:ensure-trial-zones-registration-open
 */
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrlToEnv } from "../src/lib/database-url";
import { loadProjectEnv } from "../src/lib/load-env";
import { ensureAllTrialZonesRegistrationOpen } from "../src/lib/trial-zone-registration-open";

loadProjectEnv();
applyDatabaseUrlToEnv();

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main(): Promise<void> {
  const count = await ensureAllTrialZonesRegistrationOpen();
  console.log(count > 0 ? `Re-opened registration on ${count} trial zone(s).` : "All trial zones already open for registration.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
