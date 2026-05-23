import { createHash, randomInt, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { getRegistrationSigningSecret } from "@/lib/secrets";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function hashOtp(email: string, otp: string): string {
  const pepper = getRegistrationSigningSecret();
  return createHash("sha256").update(`${pepper}:${email.toLowerCase()}:${otp}`).digest("hex");
}

function otpHashesMatch(stored: string, candidate: string): boolean {
  if (stored.length !== candidate.length) return false;
  try {
    return timingSafeEqual(Buffer.from(stored, "utf8"), Buffer.from(candidate, "utf8"));
  } catch {
    return false;
  }
}

export function generateSixDigitOtp(): string {
  return String(randomInt(100000, 1000000));
}

export async function createRegistrationOtp(email: string, registrationId: string): Promise<string> {
  const normalized = email.toLowerCase().trim();
  const otp = generateSixDigitOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.registrationAccessOtp.updateMany({
    where: { email: normalized, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });

  await prisma.registrationAccessOtp.create({
    data: {
      email: normalized,
      registrationId,
      otpHash: hashOtp(normalized, otp),
      expiresAt,
    },
  });

  return otp;
}

export async function verifyRegistrationOtp(
  email: string,
  otp: string,
): Promise<{ ok: true; registrationId: string } | { ok: false; error: string }> {
  const normalized = email.toLowerCase().trim();
  const cleanOtp = otp.replace(/\D/g, "");
  if (cleanOtp.length !== 6) {
    return { ok: false, error: "Enter the 6-digit code from your email." };
  }

  const row = await prisma.registrationAccessOtp.findFirst({
    where: {
      email: normalized,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!row) {
    return { ok: false, error: "Code expired or not found. Request a new code." };
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Too many attempts. Request a new code." };
  }

  const valid = otpHashesMatch(row.otpHash, hashOtp(normalized, cleanOtp));
  if (!valid) {
    await prisma.registrationAccessOtp.update({
      where: { id: row.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "Incorrect code. Please try again." };
  }

  await prisma.registrationAccessOtp.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });

  return { ok: true, registrationId: row.registrationId };
}
