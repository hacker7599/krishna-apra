import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/normalize-phone";
import {
  duplicateRegistrationMessage,
  findExistingRegistration,
  type DuplicateRegistrationHit,
} from "@/lib/registration-duplicate";
import { isPendingPaymentStatus } from "@/lib/registration-payment-status";

type DbClient = Prisma.TransactionClient | typeof prisma;

export type ContactResolveResult =
  | { kind: "none" }
  | { kind: "enrolled"; hit: DuplicateRegistrationHit }
  | { kind: "pending"; id: string; email: string; phone: string }
  | { kind: "conflict"; message: string };

export async function resolveContactForRegistration(
  email: string,
  phone: string,
  db: DbClient = prisma,
): Promise<ContactResolveResult> {
  const emailNorm = email.toLowerCase().trim();
  const phoneNorm = normalizePhone(phone);

  const enrolled = await findExistingRegistration(emailNorm, phoneNorm, db);
  if (enrolled) return { kind: "enrolled", hit: enrolled };

  const byEmail = await db.registration.findUnique({
    where: { email: emailNorm },
    select: { id: true, paymentStatus: true, email: true, phone: true },
  });
  const byPhone = await db.registration.findUnique({
    where: { phone: phoneNorm },
    select: { id: true, paymentStatus: true, email: true, phone: true },
  });

  if (byEmail && byPhone && byEmail.id !== byPhone.id) {
    return {
      kind: "conflict",
      message:
        "This email and mobile number are linked to different registrations. Please use the same contact details as before or contact the league desk.",
    };
  }

  const row = byEmail ?? byPhone;
  if (row && isPendingPaymentStatus(row.paymentStatus)) {
    return { kind: "pending", id: row.id, email: row.email, phone: row.phone };
  }

  return { kind: "none" };
}

export function enrolledDuplicateMessage(hit: DuplicateRegistrationHit): string {
  return duplicateRegistrationMessage(hit);
}

export const resumeRegistrationMessage =
  "We found your previous application with this email or mobile. Submitting will update your details and take you to payment.";
