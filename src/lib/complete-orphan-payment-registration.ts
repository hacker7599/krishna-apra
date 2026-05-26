import type { PaymentOrder, Registration } from "@prisma/client";
import {
  assertEligibleDateOfBirth,
  buildRegistrationCreateData,
  findDuplicateRegistrationExcluding,
  type AdminRegistrationCreateInput,
} from "@/lib/admin-registration-mutation";
import { linkPaymentOrderToRegistration } from "@/lib/confirm-razorpay-payment";
import { normalizePhone } from "@/lib/normalize-phone";
import { prisma } from "@/lib/prisma";
import { signRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { sendRegistrationConfirmationEmail } from "@/lib/send-registration-email";
import { findPublishedTrialZone } from "@/lib/validate-trial-zone";

export type OrphanPaymentOrder = PaymentOrder;

export function assertOrphanPaymentCompletable(order: OrphanPaymentOrder): string | null {
  if (order.status !== "paid") {
    return "This payment is not marked as paid yet.";
  }
  if (order.registrationId) {
    return "This payment is already linked to a registration.";
  }
  if (!order.razorpayPaymentId) {
    return "This order has no Razorpay payment ID — it cannot be completed as an online payment.";
  }
  if (!order.email?.trim() || !order.phone?.trim()) {
    return "This payment order is missing email or phone from checkout.";
  }
  return null;
}

function contactMatchesOrder(
  order: OrphanPaymentOrder,
  registration: { email: string; phone: string },
): boolean {
  const emailOk = registration.email.toLowerCase() === order.email!.toLowerCase().trim();
  const phoneOk = normalizePhone(registration.phone) === normalizePhone(order.phone!);
  return emailOk && phoneOk;
}

export async function linkExistingRegistrationToOrphanPayment(
  order: OrphanPaymentOrder,
  registrationId: string,
): Promise<{ ok: true; registration: Registration } | { ok: false; error: string }> {
  const block = assertOrphanPaymentCompletable(order);
  if (block) return { ok: false, error: block };

  const registration = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!registration) {
    return { ok: false, error: "Registration not found." };
  }

  if (!contactMatchesOrder(order, registration)) {
    return {
      ok: false,
      error: "Email and phone on the registration must match this payment order.",
    };
  }

  if (registration.razorpayOrderId && registration.razorpayOrderId !== order.razorpayOrderId) {
    return { ok: false, error: "This registration is already linked to a different Razorpay payment." };
  }

  const otherReg = await prisma.registration.findUnique({ where: { razorpayOrderId: order.razorpayOrderId } });
  if (otherReg && otherReg.id !== registration.id) {
    return { ok: false, error: "This Razorpay payment is already linked to another registration." };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.registration.update({
      where: { id: registrationId },
      data: {
        paymentStatus: "paid",
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        transactionRef: order.razorpayPaymentId,
      },
    });
    await tx.paymentOrder.update({
      where: { id: order.id },
      data: { registrationId: row.id },
    });
    return row;
  });

  await linkPaymentOrderToRegistration(order.razorpayOrderId, order.razorpayPaymentId!, updated.id);

  return { ok: true, registration: updated };
}

export async function createRegistrationFromOrphanPayment(
  order: OrphanPaymentOrder,
  input: AdminRegistrationCreateInput,
  files?: { playerPhotoPath: string; idProofPath?: string | null },
): Promise<{ ok: true; registration: Registration; emailSent: boolean } | { ok: false; error: string }> {
  const block = assertOrphanPaymentCompletable(order);
  if (block) return { ok: false, error: block };

  const emailNorm = input.email.toLowerCase().trim();
  const phoneNorm = normalizePhone(input.phone);

  if (order.email!.toLowerCase() !== emailNorm || normalizePhone(order.phone!) !== phoneNorm) {
    return {
      ok: false,
      error: "Email and mobile must match the details used when this payment was made.",
    };
  }

  if (order.playerName?.trim() && input.playerName.trim() !== order.playerName.trim()) {
    return {
      ok: false,
      error: `Player name should match checkout: “${order.playerName}”.`,
    };
  }

  const dobError = assertEligibleDateOfBirth(input.dateOfBirth);
  if (dobError) return { ok: false, error: dobError };

  const dup = await findDuplicateRegistrationExcluding(emailNorm, phoneNorm);
  if (dup) {
    const msg =
      dup.matched === "email"
        ? "A registration already exists for this email. Use “Link existing registration” instead."
        : "A registration already exists for this mobile. Use “Link existing registration” instead.";
    return { ok: false, error: msg };
  }

  const existingOrderReg = await prisma.registration.findUnique({
    where: { razorpayOrderId: order.razorpayOrderId },
  });
  if (existingOrderReg) {
    return { ok: false, error: "This Razorpay payment is already linked to a registration." };
  }

  if (input.trialZoneId?.trim()) {
    const zone = await findPublishedTrialZone(input.trialZoneId.trim());
    if (!zone) return { ok: false, error: "Please select a valid published trial zone." };
  }

  if (!files?.playerPhotoPath?.trim()) {
    return { ok: false, error: "Player photo is required." };
  }

  const registration = await prisma.$transaction(async (tx) => {
    const row = await tx.registration.create({
      data: {
        ...buildRegistrationCreateData(
          { ...input, paymentStatus: "paid" },
          { playerPhotoPath: files.playerPhotoPath, idProofPath: files.idProofPath ?? null },
        ),
        paymentStatus: "paid",
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        transactionRef: order.razorpayPaymentId,
      },
    });
    await tx.paymentOrder.update({
      where: { id: order.id },
      data: { registrationId: row.id },
    });
    return row;
  });

  await linkPaymentOrderToRegistration(order.razorpayOrderId, order.razorpayPaymentId!, registration.id);

  let emailSent = false;
  try {
    const token = await signRegistrationConfirmationToken(registration.id);
    const emailResult = await sendRegistrationConfirmationEmail({
      registrationId: registration.id,
      email: registration.email,
      playerName: registration.playerName,
      confirmationToken: token,
    });
    emailSent = emailResult.sent;
  } catch {
    emailSent = false;
  }

  return { ok: true, registration, emailSent };
}
