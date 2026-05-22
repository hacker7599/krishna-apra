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

export async function findExistingRegistration(
  email: string,
  phone: string,
): Promise<DuplicateRegistrationHit | null> {
  const emailNorm = email.toLowerCase().trim();
  const phoneNorm = normalizePhone(phone);

  const byEmail = await prisma.registration.findFirst({
    where: { email: emailNorm },
    select: { id: true, email: true, phone: true, playerName: true, createdAt: true },
  });
  if (byEmail) {
    return { ...byEmail, matched: "email" };
  }

  const candidates = await prisma.registration.findMany({
    where: {
      OR: [{ phone: phoneNorm }, { phone: { contains: phoneNorm } }],
    },
    select: { id: true, email: true, phone: true, playerName: true, createdAt: true },
    take: 20,
  });

  const byPhone = candidates.find((r) => normalizePhone(r.phone) === phoneNorm);
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
