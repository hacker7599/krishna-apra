import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/normalize-phone";
import { isEnrolledPaymentStatus } from "@/lib/registration-payment-status";

export type DuplicateRegistrationHit = {
  id: string;
  email: string;
  phone: string;
  playerName: string;
  createdAt: Date;
  matched: "email" | "phone";
};

type DbClient = Prisma.TransactionClient | typeof prisma;

export async function findExistingRegistration(
  email: string,
  phone: string,
  db: DbClient = prisma,
): Promise<DuplicateRegistrationHit | null> {
  const emailNorm = email.toLowerCase().trim();
  const phoneNorm = normalizePhone(phone);

  const byEmail = await db.registration.findUnique({
    where: { email: emailNorm },
    select: { id: true, email: true, phone: true, playerName: true, createdAt: true, paymentStatus: true },
  });
  if (byEmail && isEnrolledPaymentStatus(byEmail.paymentStatus)) {
    return { ...byEmail, matched: "email" };
  }

  const byPhone = await db.registration.findUnique({
    where: { phone: phoneNorm },
    select: { id: true, email: true, phone: true, playerName: true, createdAt: true, paymentStatus: true },
  });
  if (byPhone && isEnrolledPaymentStatus(byPhone.paymentStatus)) {
    return { ...byPhone, matched: "phone" };
  }

  return null;
}

/** Existing row for same contact (including awaiting-payment drafts). */
export async function findRegistrationByContact(
  email: string,
  phone: string,
  db: DbClient = prisma,
): Promise<{ id: string; paymentStatus: string | null; email: string; phone: string } | null> {
  const emailNorm = email.toLowerCase().trim();
  const phoneNorm = normalizePhone(phone);

  const byEmail = await db.registration.findUnique({
    where: { email: emailNorm },
    select: { id: true, paymentStatus: true, email: true, phone: true },
  });
  if (byEmail) return byEmail;

  const byPhone = await db.registration.findUnique({
    where: { phone: phoneNorm },
    select: { id: true, paymentStatus: true, email: true, phone: true },
  });
  if (byPhone) return byPhone;

  return null;
}

export function duplicateRegistrationMessage(hit: DuplicateRegistrationHit): string {
  if (hit.matched === "email") {
    return "This email address is already registered for a trial. Use a different email or contact the league desk if you need help.";
  }
  return "This mobile number is already registered for a trial. Use a different number or contact the league desk if you need help.";
}
