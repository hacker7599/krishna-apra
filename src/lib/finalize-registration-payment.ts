import type { Registration } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  confirmRazorpayPayment,
  linkPaymentOrderToRegistration,
  type RazorpayPaymentProof,
} from "@/lib/confirm-razorpay-payment";
import { prisma } from "@/lib/prisma";
import { REGISTRATION_PAYMENT_PAID, REGISTRATION_PAYMENT_PENDING } from "@/lib/registration-payment-status";
import { attachRegistrationReceiptCookie } from "@/lib/registration-receipt-cookie";
import { signRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { sendRegistrationConfirmationEmail } from "@/lib/send-registration-email";
import { ensurePaymentCapturedOnRazorpay } from "@/lib/razorpay";
import { withDbRetry } from "@/lib/sqlite-resilience";

async function markRegistrationPaid(
  registrationId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
): Promise<Registration> {
  const updated = await withDbRetry(() =>
    prisma.$transaction(async (tx) => {
      const row = await tx.registration.update({
        where: { id: registrationId },
        data: {
          paymentStatus: REGISTRATION_PAYMENT_PAID,
          razorpayOrderId,
          razorpayPaymentId,
          transactionRef: razorpayPaymentId,
        },
      });
      await tx.paymentOrder.updateMany({
        where: { razorpayOrderId },
        data: { registrationId: row.id, status: "paid", razorpayPaymentId },
      });
      return row;
    }),
  );

  await linkPaymentOrderToRegistration(razorpayOrderId, razorpayPaymentId, updated.id);
  return updated;
}

async function sendConfirmationIfNeeded(registration: Registration): Promise<boolean> {
  try {
    const token = await signRegistrationConfirmationToken(registration.id);
    const emailResult = await sendRegistrationConfirmationEmail({
      registrationId: registration.id,
      email: registration.email,
      playerName: registration.playerName,
      confirmationToken: token,
    });
    return emailResult.sent;
  } catch {
    return false;
  }
}

export async function finalizeRegistrationAfterPayment(
  registrationId: string,
  proof: RazorpayPaymentProof,
  registrant: { email: string; phone: string; playerName: string },
  clientIp?: string,
): Promise<{ ok: true; registration: Registration; emailSent: boolean } | { ok: false; error: string }> {
  const registration = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!registration) {
    return { ok: false, error: "Registration not found. Please start again from the registration form." };
  }

  if (registration.paymentStatus === REGISTRATION_PAYMENT_PAID) {
    if (
      registration.razorpayOrderId === proof.razorpayOrderId &&
      registration.razorpayPaymentId === proof.razorpayPaymentId
    ) {
      return { ok: true, registration, emailSent: false };
    }
    return { ok: false, error: "This registration is already completed with a different payment." };
  }

  if (registration.paymentStatus !== REGISTRATION_PAYMENT_PENDING) {
    return { ok: false, error: "This registration cannot accept an online payment in its current state." };
  }

  const confirmed = await confirmRazorpayPayment(proof, registrant, clientIp, registrationId);
  if (!confirmed.ok) {
    return { ok: false, error: confirmed.error };
  }

  const order = await prisma.paymentOrder.findUnique({ where: { razorpayOrderId: proof.razorpayOrderId } });
  if (order?.registrationId && order.registrationId !== registrationId) {
    return { ok: false, error: "This payment belongs to another registration." };
  }

  const updated = await markRegistrationPaid(registrationId, proof.razorpayOrderId, proof.razorpayPaymentId);
  const emailSent = await sendConfirmationIfNeeded(updated);

  return { ok: true, registration: updated, emailSent };
}

/** Webhook / server-side: payment verified on Razorpay without checkout signature. */
export async function finalizeRegistrationFromCapturedPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
): Promise<{ ok: true; registrationId: string } | { ok: false; reason: string }> {
  const order = await prisma.paymentOrder.findUnique({ where: { razorpayOrderId } });
  if (!order?.registrationId) {
    return { ok: false, reason: "no_registration_link" };
  }

  const registration = await prisma.registration.findUnique({ where: { id: order.registrationId } });
  if (!registration) {
    return { ok: false, reason: "registration_not_found" };
  }

  if (registration.paymentStatus === REGISTRATION_PAYMENT_PAID) {
    return { ok: true, registrationId: registration.id };
  }

  if (registration.paymentStatus !== REGISTRATION_PAYMENT_PENDING) {
    return { ok: false, reason: "not_pending" };
  }

  const captured = await ensurePaymentCapturedOnRazorpay(razorpayOrderId, razorpayPaymentId);
  if (!captured.ok) {
    return { ok: false, reason: captured.status };
  }

  const updated = await markRegistrationPaid(registration.id, razorpayOrderId, razorpayPaymentId);
  await sendConfirmationIfNeeded(updated);

  return { ok: true, registrationId: updated.id };
}

export function registrationSuccessResponse(
  req: NextRequest,
  registrationId: string,
  emailSent: boolean,
  emailError?: string,
) {
  return signRegistrationConfirmationToken(registrationId).then((confirmationToken) => {
    const res = NextResponse.json({
      ok: true,
      registrationId,
      emailSent,
      emailError: emailSent ? undefined : emailError,
    });
    attachRegistrationReceiptCookie(res, confirmationToken, req);
    return res;
  });
}
