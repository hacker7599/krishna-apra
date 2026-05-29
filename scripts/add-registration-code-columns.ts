/**
 * Adds registrationCode / paymentCode columns without `prisma db push`
 * (avoids XAMPP MariaDB mysql.proc introspection errors).
 *
 * Run: npm run db:add-code-columns
 * Then: npm run db:backfill-codes
 */
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrlToEnv } from "../src/lib/database-url";
import { loadProjectEnv } from "../src/lib/load-env";

loadProjectEnv();
applyDatabaseUrlToEnv();

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ c: bigint }[]>(
    `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    table,
    column,
  );
  return Number(rows[0]?.c ?? 0) > 0;
}

async function indexExists(table: string, indexName: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ c: bigint }[]>(
    `SELECT COUNT(*) AS c FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    table,
    indexName,
  );
  return Number(rows[0]?.c ?? 0) > 0;
}

async function main(): Promise<void> {
  const table = "Registration";

  if (!(await columnExists(table, "registrationCode"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `Registration` ADD COLUMN `registrationCode` VARCHAR(191) NULL",
    );
    console.log("Added column Registration.registrationCode");
  } else {
    console.log("Column Registration.registrationCode already exists");
  }

  if (!(await columnExists(table, "paymentCode"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `Registration` ADD COLUMN `paymentCode` VARCHAR(191) NULL",
    );
    console.log("Added column Registration.paymentCode");
  } else {
    console.log("Column Registration.paymentCode already exists");
  }

  if (!(await indexExists(table, "Registration_registrationCode_key"))) {
    await prisma.$executeRawUnsafe(
      "CREATE UNIQUE INDEX `Registration_registrationCode_key` ON `Registration`(`registrationCode`)",
    );
    console.log("Created unique index Registration_registrationCode_key");
  }

  if (!(await indexExists(table, "Registration_paymentCode_key"))) {
    await prisma.$executeRawUnsafe(
      "CREATE UNIQUE INDEX `Registration_paymentCode_key` ON `Registration`(`paymentCode`)",
    );
    console.log("Created unique index Registration_paymentCode_key");
  }

  console.log("\nDone. Next: npm run db:backfill-codes");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
