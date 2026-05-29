/**
 * Verifies MySQL registration rows have all expected columns populated / readable.
 * Run: npm run db:verify-registrations
 */
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrlToEnv } from "../src/lib/database-url";
import { loadProjectEnv } from "../src/lib/load-env";
import { toRegistrationConfirmation } from "../src/lib/registration-confirmation";

loadProjectEnv();
applyDatabaseUrlToEnv();

const REQUIRED_STRING = [
  "academyName",
  "playerName",
  "email",
  "phone",
  "roles",
  "paymentStatus",
] as const;

async function main(): Promise<void> {
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  try {
    const rows = await prisma.registration.findMany({
      include: { trialZone: { select: { trialPlace: true, zone: true } } },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Registrations in MySQL: ${rows.length}\n`);

    if (rows.length === 0) {
      console.log("No registrations to verify. Submit a test on /register or migrate SQLite data.");
      return;
    }

    let issues = 0;
    for (const row of rows) {
      const conf = toRegistrationConfirmation(row);
      const missing: string[] = [];
      for (const key of REQUIRED_STRING) {
        const v = row[key];
        if (v == null || String(v).trim() === "") missing.push(key);
      }
      if (!row.dateOfBirth) missing.push("dateOfBirth");
      if (!row.fatherName?.trim()) missing.push("fatherName");
      if (!row.address?.trim()) missing.push("address");
      if (!row.jerseySize) missing.push("jerseySize");
      if (!row.shoeSize?.trim()) missing.push("shoeSize");
      if (!row.idDocumentType) missing.push("idDocumentType");
      if (!row.trialZoneId) missing.push("trialZoneId");
      if (!row.playerPhotoPath) missing.push("playerPhotoPath");
      if (!row.idProofPath) missing.push("idProofPath");

      console.log(`— ${row.playerName} (${row.email})`);
      console.log(`  payment: ${row.paymentStatus} | zone: ${conf.trialZone ?? "—"}`);
      console.log(`  roles: ${conf.roles.join(", ")}`);
      if (missing.length) {
        issues += 1;
        console.log(`  ⚠ missing/empty: ${missing.join(", ")}`);
      } else {
        console.log(`  ✓ all core fields present`);
      }
    }

    const zones = await prisma.trialZone.count({ where: { published: true } });
    console.log(`\nPublished trial zones for picker: ${zones}`);

    if (issues > 0) {
      console.log(`\n${issues} registration(s) with gaps (may be legacy partial rows).`);
      process.exitCode = 1;
    } else {
      console.log("\nAll registrations pass field checks.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
