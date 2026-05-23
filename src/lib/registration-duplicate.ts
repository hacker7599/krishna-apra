import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/normalize-phone";

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
    select: { id: true, email: true, phone: true, playerName: true, createdAt: true },
  });
  if (byEmail) {
    return { ...byEmail, matched: "email" };
  }

  const byPhone = await db.registration.findUnique({
    where: { phone: phoneNorm },
    select: { id: true, email: true, phone: true, playerName: true, createdAt: true },
  });
  if (byPhone) {
    return { ...byPhone, matched: "phone" };
  }

  return null;
}

export function duplicateRegistrationMessage(hit: DuplicateRegistrationHit): string {
  if (hit.matched === "email") {
    return "This email address is already registered for a trial. Use a different email or contact the league desk if you need help.";
  }
  return "This mobile number is already registered for a trial. Use a different number or contact the league desk if you need help.";
}
