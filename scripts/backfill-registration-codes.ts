/**
 * Assigns registrationCode / paymentCode to rows missing them.
 * Run: npm run db:backfill-codes
 */
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrlToEnv } from "../src/lib/database-url";
import { loadProjectEnv } from "../src/lib/load-env";
import {
  allocateRegistrationCode,
  allocatePaymentCode,
} from "../src/lib/registration-codes";
import { REGISTRATION_PAYMENT_PAID } from "../src/lib/registration-payment-status";

loadProjectEnv();
applyDatabaseUrlToEnv();

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT registrationCode, paymentCode FROM Registration LIMIT 1`;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("registrationCode") || msg.includes("paymentCode")) {
      console.error(
        "Columns registrationCode / paymentCode are missing. Run first:\n  npm run db:add-code-columns\n",
      );
      process.exit(1);
    }
    throw e;
  }

  const missingReg = await prisma.registration.findMany({
    where: { registrationCode: null },
    select: { id: true },
  });
  for (const row of missingReg) {
    await prisma.registration.update({
      where: { id: row.id },
      data: { registrationCode: await allocateRegistrationCode() },
    });
  }
  console.log(`Assigned registration codes: ${missingReg.length}`);

  const missingPay = await prisma.registration.findMany({
    where: { paymentCode: null, paymentStatus: REGISTRATION_PAYMENT_PAID },
    select: { id: true },
  });
  for (const row of missingPay) {
    await prisma.registration.update({
      where: { id: row.id },
      data: { paymentCode: await allocatePaymentCode() },
    });
  }
  console.log(`Assigned payment codes: ${missingPay.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
