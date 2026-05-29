import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type RegistrationCodesMode = "prisma" | "raw" | "unsupported";

let cachedMode: RegistrationCodesMode | null = null;
let warned = false;

function isUnknownCodeFieldError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientValidationError)) return false;
  const message = error.message;
  return (
    message.includes("Unknown field") &&
    (message.includes("registrationCode") || message.includes("paymentCode"))
  );
}

async function registrationCodeColumnExists(): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ c: bigint }[]>(
    `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Registration' AND COLUMN_NAME = 'registrationCode'`,
  );
  return Number(rows[0]?.c ?? 0) > 0;
}

function warnOnce(message: string): void {
  if (warned) return;
  warned = true;
  console.warn(`[registration-codes] ${message}`);
}

/** Detect whether registration/payment codes can be read and written. */
export async function getRegistrationCodesMode(): Promise<RegistrationCodesMode> {
  if (cachedMode) return cachedMode;

  try {
    await prisma.registration.findFirst({
      select: { registrationCode: true },
      take: 1,
    });
    cachedMode = "prisma";
    return cachedMode;
  } catch (error) {
    if (!isUnknownCodeFieldError(error)) throw error;
  }

  if (await registrationCodeColumnExists()) {
    warnOnce("Prisma client is out of date. Run: npm run db:generate — using raw SQL for codes.");
    cachedMode = "raw";
    return cachedMode;
  }

  warnOnce("Database columns missing. Run: npm run db:add-code-columns && npm run db:backfill-codes");
  cachedMode = "unsupported";
  return cachedMode;
}

export function resetRegistrationCodesModeCache(): void {
  cachedMode = null;
}
