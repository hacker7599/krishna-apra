import type { Registration, RegistrationPaymentInvite, TrialZone } from "@prisma/client";
import { getAppBaseUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import { isPendingPaymentStatus, REGISTRATION_PAYMENT_PAID } from "@/lib/registration-payment-status";
import { getRegistrationSigningSecret } from "@/lib/secrets";
import { withDbRetry } from "@/lib/db-resilience";
import { hashCompletionInviteToken, generateCompletionInviteToken } from "@/lib/registration-completion-invite";

export const PAYMENT_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function registrationPaymentUrl(plainToken: string): string {
  return `${getAppBaseUrl()}/register/pay?token=${encodeURIComponent(plainToken)}`;
}

export function registrationPaymentFallbackUrl(): string {
  return `${getAppBaseUrl()}/register/pay`;
}

export type PaymentInviteContext = {
  invite: RegistrationPaymentInvite;
  registration: Registration & {
    trialZone: Pick<TrialZone, "trialPlace" | "zone"> | null;
  };
};

export async function loadValidPaymentInvite(plainToken: string): Promise<
  | { ok: true; ctx: PaymentInviteContext }
  | { ok: false; error: string; status: number }
> {
  const trimmed = plainToken.trim();
  if (!trimmed || trimmed.length > 200) {
    return { ok: false, error: "This payment link is invalid.", status: 400 };
  }

  const invite = await prisma.registrationPaymentInvite.findUnique({
    where: { tokenHash: hashCompletionInviteToken(trimmed) },
  });
  if (!invite) {
    return { ok: false, error: "This payment link is invalid or has expired.", status: 404 };
  }
  if (invite.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "This payment link has expired. Enter your mobile number below to get a new link.", status: 410 };
  }

  const registration = await prisma.registration.findUnique({
    where: { id: invite.registrationId },
    include: { trialZone: { select: { trialPlace: true, zone: true } } },
  });
  if (!registration) {
    return { ok: false, error: "Registration not found.", status: 404 };
  }
  if (registration.paymentStatus === REGISTRATION_PAYMENT_PAID) {
    return { ok: false, error: "Payment is already complete for this registration.", status: 410 };
  }
  if (!isPendingPaymentStatus(registration.paymentStatus)) {
    return { ok: false, error: "This registration is not awaiting payment.", status: 410 };
  }

  return { ok: true, ctx: { invite, registration } };
}

export async function createPaymentInviteForRegistration(registrationId: string): Promise<
  | {
      ok: true;
      plainToken: string;
      paymentUrl: string;
      expiresAt: Date;
      email: string;
    }
  | { ok: false; error: string; status: number }
> {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: {
      id: true,
      email: true,
      paymentStatus: true,
      playerName: true,
    },
  });
  if (!registration) {
    return { ok: false, error: "Registration not found.", status: 404 };
  }
  if (!isPendingPaymentStatus(registration.paymentStatus)) {
    return { ok: false, error: "This registration is not awaiting payment.", status: 400 };
  }
  const email = registration.email.trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "This registration has no email on file.", status: 400 };
  }

  const { plain, hash } = generateCompletionInviteToken();
  const expiresAt = new Date(Date.now() + PAYMENT_INVITE_TTL_MS);

  await withDbRetry(async () => {
    await prisma.registrationPaymentInvite.deleteMany({ where: { registrationId } });
    await prisma.registrationPaymentInvite.create({
      data: {
        tokenHash: hash,
        registrationId,
        email,
        expiresAt,
      },
    });
  });

  return {
    ok: true,
    plainToken: plain,
    paymentUrl: registrationPaymentUrl(plain),
    expiresAt,
    email,
  };
}

export async function revokePaymentInvitesForRegistration(registrationId: string): Promise<void> {
  await prisma.registrationPaymentInvite.deleteMany({ where: { registrationId } });
}

/** Normalize Indian mobile to digits-only 10-digit local part when possible. */
export function normalizeLookupPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export async function createPaymentInviteByPhone(phoneRaw: string): Promise<
  | { ok: true; paymentUrl: string; plainToken: string }
  | { ok: false; error: string; status: number }
> {
  const phone = normalizeLookupPhone(phoneRaw);
  if (phone.length < 10) {
    return { ok: false, error: "Enter a valid 10-digit mobile number.", status: 400 };
  }

  const candidates = await prisma.registration.findMany({
    where: {
      paymentStatus: { in: ["pending_payment", "pending"] },
    },
    select: { id: true, phone: true, paymentStatus: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const match = candidates.find((r) => normalizeLookupPhone(r.phone) === phone);
  if (!match) {
    return {
      ok: false,
      error: "No pending registration found for this mobile number. Check the number or contact the league desk.",
      status: 404,
    };
  }

  const created = await createPaymentInviteForRegistration(match.id);
  if (!created.ok) {
    return { ok: false, error: created.error, status: created.status };
  }
  return { ok: true, paymentUrl: created.paymentUrl, plainToken: created.plainToken };
}
