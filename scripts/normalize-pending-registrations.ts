/**
 * One-time maintenance: map legacy paymentStatus "pending" → "pending_payment".
 * Run: npx tsx scripts/normalize-pending-registrations.ts
 */
import { PrismaClient } from "@prisma/client";
import { REGISTRATION_PAYMENT_PENDING } from "../src/lib/registration-payment-status";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.registration.updateMany({
    where: { paymentStatus: "pending" },
    data: { paymentStatus: REGISTRATION_PAYMENT_PENDING },
  });
  console.log(`Updated ${result.count} registration(s) to pending_payment.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
