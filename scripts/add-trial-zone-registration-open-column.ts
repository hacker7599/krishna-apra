/**
 * Adds TrialZone.registrationOpen without full `prisma db push`.
 * Run: npm run db:add-trial-zone-registration-open
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

async function main(): Promise<void> {
  const table = "TrialZone";
  const column = "registrationOpen";
  if (await columnExists(table, column)) {
    console.log(`Column ${table}.${column} already exists.`);
    return;
  }
  await prisma.$executeRawUnsafe(
    `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` TINYINT(1) NOT NULL DEFAULT 1`,
  );
  console.log(`Added ${table}.${column} (default: open for registration).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
