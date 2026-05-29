import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import type { Prisma as PrismaTypes } from "@prisma/client";
import { getRegistrationCodesMode } from "@/lib/registration-codes-capability";
import { prisma } from "@/lib/prisma";
import { REGISTRATION_PAYMENT_PAID } from "@/lib/registration-payment-status";

type DbClient = PrismaTypes.TransactionClient | typeof prisma;

export class RegistrationCodesUnavailableError extends Error {
  constructor() {
    super(
      "Registration codes are not configured. Run: npm run db:add-code-columns && npm run db:backfill-codes && npm run db:generate",
    );
    this.name = "RegistrationCodesUnavailableError";
  }
}

function randomSegment(length = 6): string {
  return randomBytes(5)
    .toString("base64url")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, length)
    .toUpperCase();
}

export function normalizeRegistrationCodeInput(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

type CodeRow = { registrationCode: string | null; paymentCode: string | null };

async function readCodesRaw(db: DbClient, registrationId: string): Promise<CodeRow | null> {
  const rows = await db.$queryRawUnsafe<CodeRow[]>(
    "SELECT `registrationCode`, `paymentCode` FROM `Registration` WHERE `id` = ? LIMIT 1",
    registrationId,
  );
  return rows[0] ?? null;
}

async function registrationCodeTakenRaw(db: DbClient, code: string): Promise<boolean> {
  const rows = await db.$queryRawUnsafe<{ id: string }[]>(
    "SELECT `id` FROM `Registration` WHERE `registrationCode` = ? LIMIT 1",
    code,
  );
  return rows.length > 0;
}

async function paymentCodeTakenRaw(db: DbClient, code: string): Promise<boolean> {
  const rows = await db.$queryRawUnsafe<{ id: string }[]>(
    "SELECT `id` FROM `Registration` WHERE `paymentCode` = ? LIMIT 1",
    code,
  );
  return rows.length > 0;
}

async function allocateRegistrationCodeRaw(db: DbClient): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = `FSU15-R-${randomSegment(6)}`;
    if (!(await registrationCodeTakenRaw(db, code))) return code;
  }
  throw new Error("Could not allocate registration code");
}

async function allocatePaymentCodeRaw(db: DbClient): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = `FSU15-P-${randomSegment(6)}`;
    if (!(await paymentCodeTakenRaw(db, code))) return code;
  }
  throw new Error("Could not allocate payment code");
}

export async function readRegistrationCodes(
  registrationId: string,
  db: DbClient = prisma,
): Promise<CodeRow> {
  const mode = await getRegistrationCodesMode();
  if (mode === "unsupported") {
    return { registrationCode: null, paymentCode: null };
  }
  if (mode === "raw") {
    return (await readCodesRaw(db, registrationId)) ?? { registrationCode: null, paymentCode: null };
  }
  const row = await db.registration.findUnique({
    where: { id: registrationId },
    select: { registrationCode: true, paymentCode: true },
  });
  return row ?? { registrationCode: null, paymentCode: null };
}

/** Ensures codes exist when possible; returns null if DB/client is not configured (admin-safe). */
export async function tryEnsureRegistrationCodes(
  registrationId: string,
  opts?: { assignPaymentIfPaid?: boolean; paymentStatus?: string | null },
): Promise<CodeRow> {
  try {
    const registrationCode = await ensureRegistrationCode(registrationId);
    let paymentCode: string | null = null;
    if (opts?.assignPaymentIfPaid && opts.paymentStatus === REGISTRATION_PAYMENT_PAID) {
      paymentCode = await assignPaymentCodeOnPaid(registrationId);
    } else {
      paymentCode = (await readRegistrationCodes(registrationId)).paymentCode;
    }
    return { registrationCode, paymentCode };
  } catch (error) {
    if (error instanceof RegistrationCodesUnavailableError) {
      return readRegistrationCodes(registrationId);
    }
    throw error;
  }
}

export async function allocateRegistrationCode(db: DbClient = prisma): Promise<string> {
  const mode = await getRegistrationCodesMode();
  if (mode === "unsupported") throw new RegistrationCodesUnavailableError();
  if (mode === "raw") return allocateRegistrationCodeRaw(db);

  for (let attempt = 0; attempt < 12; attempt++) {
    const code = `FSU15-R-${randomSegment(6)}`;
    const existing = await db.registration.findUnique({
      where: { registrationCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("Could not allocate registration code");
}

export async function allocatePaymentCode(db: DbClient = prisma): Promise<string> {
  const mode = await getRegistrationCodesMode();
  if (mode === "unsupported") throw new RegistrationCodesUnavailableError();
  if (mode === "raw") return allocatePaymentCodeRaw(db);

  for (let attempt = 0; attempt < 12; attempt++) {
    const code = `FSU15-P-${randomSegment(6)}`;
    const existing = await db.registration.findUnique({
      where: { paymentCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("Could not allocate payment code");
}

export async function ensureRegistrationCode(
  registrationId: string,
  db: DbClient = prisma,
): Promise<string> {
  const mode = await getRegistrationCodesMode();
  if (mode === "unsupported") throw new RegistrationCodesUnavailableError();

  if (mode === "raw") {
    const existing = await readCodesRaw(db, registrationId);
    if (existing?.registrationCode) return existing.registrationCode;
    const code = await allocateRegistrationCodeRaw(db);
    await db.$executeRawUnsafe(
      "UPDATE `Registration` SET `registrationCode` = ? WHERE `id` = ?",
      code,
      registrationId,
    );
    return code;
  }

  const row = await db.registration.findUnique({
    where: { id: registrationId },
    select: { registrationCode: true },
  });
  if (row?.registrationCode) return row.registrationCode;

  const code = await allocateRegistrationCode(db);
  await db.registration.update({
    where: { id: registrationId },
    data: { registrationCode: code },
  });
  return code;
}

export async function assignPaymentCodeOnPaid(
  registrationId: string,
  db: DbClient = prisma,
): Promise<string | null> {
  const mode = await getRegistrationCodesMode();
  if (mode === "unsupported") return null;

  if (mode === "raw") {
    const row = await db.$queryRawUnsafe<{ paymentCode: string | null; paymentStatus: string | null }[]>(
      "SELECT `paymentCode`, `paymentStatus` FROM `Registration` WHERE `id` = ? LIMIT 1",
      registrationId,
    );
    const current = row[0];
    if (!current || current.paymentStatus !== REGISTRATION_PAYMENT_PAID) {
      return current?.paymentCode ?? null;
    }
    if (current.paymentCode) return current.paymentCode;
    const code = await allocatePaymentCodeRaw(db);
    await db.$executeRawUnsafe(
      "UPDATE `Registration` SET `paymentCode` = ? WHERE `id` = ?",
      code,
      registrationId,
    );
    return code;
  }

  const row = await db.registration.findUnique({
    where: { id: registrationId },
    select: { paymentCode: true, paymentStatus: true },
  });
  if (!row || row.paymentStatus !== REGISTRATION_PAYMENT_PAID) return row?.paymentCode ?? null;
  if (row.paymentCode) return row.paymentCode;

  const code = await allocatePaymentCode(db);
  await db.registration.update({
    where: { id: registrationId },
    data: { paymentCode: code },
  });
  return code;
}

export function isRegistrationCodesClientError(error: unknown): boolean {
  if (error instanceof RegistrationCodesUnavailableError) return true;
  if (!(error instanceof Prisma.PrismaClientValidationError)) return false;
  return error.message.includes("registrationCode") || error.message.includes("paymentCode");
}
