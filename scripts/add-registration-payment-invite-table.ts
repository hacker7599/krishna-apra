/**
 * Creates RegistrationPaymentInvite table without `prisma db push`
 * (works around XAMPP MariaDB mysql.proc introspection errors).
 *
 * Run: npm run db:add-payment-invite-table
 * Then restart the dev server: npm run dev
 */
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrlToEnv } from "../src/lib/database-url";
import { loadProjectEnv } from "../src/lib/load-env";

loadProjectEnv();
applyDatabaseUrlToEnv();

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function tableExists(table: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ c: bigint }[]>(
    `SELECT COUNT(*) AS c FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    table,
  );
  return Number(rows[0]?.c ?? 0) > 0;
}

async function main(): Promise<void> {
  const table = "RegistrationPaymentInvite";

  if (await tableExists(table)) {
    console.log(`Table ${table} already exists — nothing to do.`);
    return;
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE \`RegistrationPaymentInvite\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`expiresAt\` DATETIME(3) NOT NULL,
      \`tokenHash\` VARCHAR(191) NOT NULL,
      \`registrationId\` VARCHAR(191) NOT NULL,
      \`email\` VARCHAR(191) NOT NULL,
      UNIQUE INDEX \`RegistrationPaymentInvite_tokenHash_key\`(\`tokenHash\`),
      UNIQUE INDEX \`RegistrationPaymentInvite_registrationId_key\`(\`registrationId\`),
      INDEX \`RegistrationPaymentInvite_expiresAt_idx\`(\`expiresAt\`),
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`RegistrationPaymentInvite_registrationId_fkey\`
        FOREIGN KEY (\`registrationId\`) REFERENCES \`Registration\`(\`id\`)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  console.log(`Created table ${table}. Restart your Next.js dev server, then try Send payment link again.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
