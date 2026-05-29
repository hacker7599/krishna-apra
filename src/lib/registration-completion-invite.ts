import crypto from "crypto";
import type { PaymentOrder, Registration, RegistrationCompletionInvite } from "@prisma/client";
import { getAppBaseUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import { isEnrolledPaymentStatus, REGISTRATION_PAYMENT_PAID, REGISTRATION_PAYMENT_PENDING } from "@/lib/registration-payment-status";
import { getRegistrationSigningSecret } from "@/lib/secrets";
import { withDbRetry } from "@/lib/db-resilience";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashCompletionInviteToken(plainToken: string): string {
  return crypto.createHmac("sha256", getRegistrationSigningSecret()).update(plainToken).digest("hex");
}

export function generateCompletionInviteToken(): { plain: string; hash: string } {
  const plain = crypto.randomBytes(32).toString("base64url");
  return { plain, hash: hashCompletionInviteToken(plain) };
}

export function registrationCompletionUrl(plainToken: string): string {
  return `${getAppBaseUrl()}/register/complete?token=${encodeURIComponent(plainToken)}`;
}

export type CompletionInviteContext = {
  invite: RegistrationCompletionInvite;
  order: PaymentOrder;
  registration: Registration | null;
};

export function paymentOrderNeedsCompletion(
  order: PaymentOrder,
  registrationPaymentStatus?: string | null,
): boolean {
  if (order.status !== "paid" || !order.razorpayPaymentId) return false;
  if (!order.email?.trim()) return false;
  if (!order.registrationId) return true;
  const status = registrationPaymentStatus;
  return status === REGISTRATION_PAYMENT_PENDING || !isEnrolledPaymentStatus(status);
}

export async function loadValidCompletionInvite(plainToken: string): Promise<
  | { ok: true; ctx: CompletionInviteContext }
  | { ok: false; error: string; status: number }
> {
  const trimmed = plainToken.trim();
  if (!trimmed || trimmed.length > 200) {
    return { ok: false, error: "This link is invalid.", status: 400 };
  }

  const invite = await prisma.registrationCompletionInvite.findUnique({
    where: { tokenHash: hashCompletionInviteToken(trimmed) },
  });
  if (!invite) {
    return { ok: false, error: "This link is invalid or has already been used.", status: 404 };
  }
  if (invite.usedAt) {
    const regId = invite.registrationId;
    if (regId) {
      const reg = await prisma.registration.findUnique({
        where: { id: regId },
        select: { paymentStatus: true },
      });
      if (reg?.paymentStatus === REGISTRATION_PAYMENT_PAID) {
        return { ok: false, error: "This registration is already complete.", status: 410 };
      }
    }
    return { ok: false, error: "This link has already been used. Contact the league desk if you need help.", status: 410 };
  }
  if (invite.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "This link has expired. Ask the league to send a new completion link.", status: 410 };
  }

  const order = await prisma.paymentOrder.findUnique({
    where: { id: invite.paymentOrderId },
  });
  if (!order) {
    return { ok: false, error: "Payment record not found.", status: 404 };
  }

  let registration: Registration | null = null;
  if (order.registrationId) {
    registration = await prisma.registration.findUnique({ where: { id: order.registrationId } });
  }
  if (!registration && invite.registrationId) {
    registration = await prisma.registration.findUnique({ where: { id: invite.registrationId } });
  }

  if (!paymentOrderNeedsCompletion(order, registration?.paymentStatus)) {
    return { ok: false, error: "This registration is already complete.", status: 410 };
  }

  return {
    ok: true,
    ctx: { invite, order, registration },
  };
}

/** Mark invite used only after enrollment succeeds. Returns false if another request already completed. */
export async function markCompletionInviteUsed(
  inviteId: string,
  registrationId: string,
): Promise<"marked" | "already_completed"> {
  const updated = await prisma.registrationCompletionInvite.updateMany({
    where: { id: inviteId, usedAt: null },
    data: { usedAt: new Date(), registrationId },
  });
  if (updated.count > 0) return "marked";

  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { paymentStatus: true },
  });
  if (reg?.paymentStatus === REGISTRATION_PAYMENT_PAID) {
    return "already_completed";
  }

  return "already_completed";
}

export async function createCompletionInviteForPaymentOrder(paymentOrderId: string): Promise<
  | {
      ok: true;
      plainToken: string;
      completionUrl: string;
      expiresAt: Date;
      email: string;
      registrationId: string | null;
    }
  | { ok: false; error: string; status: number }
> {
  const order = await prisma.paymentOrder.findUnique({
    where: { id: paymentOrderId },
  });
  if (!order) {
    return { ok: false, error: "Payment order not found.", status: 404 };
  }
  const linkedReg = order.registrationId
    ? await prisma.registration.findUnique({
        where: { id: order.registrationId },
        select: { paymentStatus: true },
      })
    : null;
  if (!paymentOrderNeedsCompletion(order, linkedReg?.paymentStatus)) {
    return { ok: false, error: "This payment does not need a completion form.", status: 400 };
  }
  const email = order.email?.trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "This payment has no email on file.", status: 400 };
  }

  const { plain, hash } = generateCompletionInviteToken();
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

  await withDbRetry(() =>
    prisma.$transaction(async (tx) => {
      await tx.registrationCompletionInvite.deleteMany({
        where: { paymentOrderId: order.id },
      });
      await tx.registrationCompletionInvite.create({
        data: {
          tokenHash: hash,
          paymentOrderId: order.id,
          registrationId: order.registrationId,
          email,
          expiresAt,
        },
      });
    }),
  );

  return {
    ok: true,
    plainToken: plain,
    completionUrl: registrationCompletionUrl(plain),
    expiresAt,
    email,
    registrationId: order.registrationId,
  };
}
