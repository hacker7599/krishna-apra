import type { PaymentOrder, Registration } from "@prisma/client";
import {
  assertEligibleDateOfBirth,
  buildRegistrationCreateData,
  buildRegistrationPatchData,
  findDuplicateRegistrationExcluding,
  type AdminRegistrationCreateInput,
} from "@/lib/admin-registration-mutation";
import { linkPaymentOrderToRegistration } from "@/lib/confirm-razorpay-payment";
import { finalizeRegistrationFromCapturedPayment } from "@/lib/finalize-registration-payment";
import { normalizePhone } from "@/lib/normalize-phone";
import { prisma } from "@/lib/prisma";
import { isEnrolledPaymentStatus, REGISTRATION_PAYMENT_PENDING } from "@/lib/registration-payment-status";
import { signRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { sendRegistrationConfirmationEmail } from "@/lib/send-registration-email";
import { withDbRetry } from "@/lib/db-resilience";
import { findPublishedTrialZone } from "@/lib/validate-trial-zone";

export type OrphanPaymentOrder = PaymentOrder;

export async function assertOrphanPaymentCompletable(order: OrphanPaymentOrder): Promise<string | null> {
  if (order.status !== "paid") {
    return "This payment is not marked as paid yet.";
  }
  if (!order.razorpayPaymentId) {
    return "This order has no Razorpay payment ID — it cannot be completed as an online payment.";
  }
  if (!order.email?.trim() || !order.phone?.trim()) {
    return "This payment order is missing email or phone from checkout.";
  }

  if (order.registrationId) {
    const reg = await prisma.registration.findUnique({
      where: { id: order.registrationId },
      select: { paymentStatus: true },
    });
    if (reg && isEnrolledPaymentStatus(reg.paymentStatus)) {
      return "This player is already enrolled. View them in Registrations.";
    }
    if (reg?.paymentStatus === REGISTRATION_PAYMENT_PENDING) {
      return null;
    }
    return "This payment is linked to a registration that cannot be completed from here.";
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

async function sendEnrollmentEmail(registration: Registration): Promise<boolean> {
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

/** Paid order with a pending_payment draft — finalize after admin fills the form. */
async function updatePendingRegistrationFromOrphanPayment(
  order: OrphanPaymentOrder,
  registrationId: string,
  input: AdminRegistrationCreateInput,
  files: { playerPhotoPath: string; idProofPath?: string | null },
): Promise<{ ok: true; registration: Registration; emailSent: boolean } | { ok: false; error: string }> {
  const registration = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!registration) {
    return { ok: false, error: "Registration draft not found." };
  }
  if (registration.paymentStatus !== REGISTRATION_PAYMENT_PENDING) {
    return { ok: false, error: "This registration is not awaiting completion." };
  }

  const emailNorm = input.email.toLowerCase().trim();
  const phoneNorm = normalizePhone(input.phone);

  if (!contactMatchesOrder(order, { email: registration.email, phone: registration.phone })) {
    return {
      ok: false,
      error: "Email and mobile on the form must match this payment order.",
    };
  }

  const dobError = assertEligibleDateOfBirth(input.dateOfBirth);
  if (dobError) return { ok: false, error: dobError };

  const dup = await findDuplicateRegistrationExcluding(emailNorm, phoneNorm, registrationId);
  if (dup) {
    return {
      ok: false,
      error:
        dup.matched === "email"
          ? "Another registration already uses this email."
          : "Another registration already uses this mobile number.",
    };
  }

  if (input.trialZoneId?.trim()) {
    const zone = await findPublishedTrialZone(input.trialZoneId.trim());
    if (!zone) return { ok: false, error: "Please select a valid published trial zone." };
  }

  await withDbRetry(() =>
    prisma.$transaction(async (tx) => {
      const row = await tx.registration.update({
        where: { id: registrationId },
        data: {
          ...buildRegistrationPatchData(input),
          playerPhotoPath: files.playerPhotoPath,
          idProofPath: files.idProofPath ?? registration.idProofPath,
          transactionRef: order.razorpayPaymentId,
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: order.razorpayPaymentId,
          paymentStatus: REGISTRATION_PAYMENT_PENDING,
        },
      });
      await tx.paymentOrder.update({
        where: { id: order.id },
        data: { registrationId: row.id },
      });
    }),
  );

  if (!order.razorpayPaymentId || !order.razorpayOrderId) {
    return { ok: false, error: "Payment is not complete on this order." };
  }

  const finalized = await finalizeRegistrationFromCapturedPayment(order.razorpayOrderId, order.razorpayPaymentId);
  if (!finalized.ok) {
    const check = await prisma.registration.findUnique({ where: { id: registrationId } });
    if (check?.paymentStatus !== "paid") {
      return {
        ok: false,
        error: "Details saved but enrollment could not be confirmed. Try again or use Email completion link.",
      };
    }
  }

  const enrolled = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!enrolled) {
    return { ok: false, error: "Registration not found after finalize." };
  }

  await linkPaymentOrderToRegistration(order.razorpayOrderId, order.razorpayPaymentId, enrolled.id);
  const emailSent = await sendEnrollmentEmail(enrolled);

  return { ok: true, registration: enrolled, emailSent };
}

export async function linkExistingRegistrationToOrphanPayment(
  order: OrphanPaymentOrder,
  registrationId: string,
): Promise<{ ok: true; registration: Registration } | { ok: false; error: string }> {
  const block = await assertOrphanPaymentCompletable(order);
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

  if (registration.paymentStatus === REGISTRATION_PAYMENT_PENDING && order.razorpayPaymentId && order.razorpayOrderId) {
    const finalized = await finalizeRegistrationFromCapturedPayment(order.razorpayOrderId, order.razorpayOrderId);
    if (!finalized.ok) {
      const check = await prisma.registration.findUnique({ where: { id: registrationId } });
      if (check?.paymentStatus !== "paid") {
        return { ok: false, error: "Could not confirm payment for this registration." };
      }
    }
  }

  const updated = await withDbRetry(() =>
    prisma.$transaction(async (tx) => {
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
    }),
  );

  await linkPaymentOrderToRegistration(order.razorpayOrderId, order.razorpayPaymentId!, updated.id);

  return { ok: true, registration: updated };
}

export async function createRegistrationFromOrphanPayment(
  order: OrphanPaymentOrder,
  input: AdminRegistrationCreateInput,
  files?: { playerPhotoPath: string; idProofPath?: string | null },
): Promise<{ ok: true; registration: Registration; emailSent: boolean } | { ok: false; error: string }> {
  const block = await assertOrphanPaymentCompletable(order);
  if (block) return { ok: false, error: block };

  if (order.registrationId && files?.playerPhotoPath) {
    const pending = await prisma.registration.findUnique({
      where: { id: order.registrationId },
      select: { paymentStatus: true },
    });
    if (pending?.paymentStatus === REGISTRATION_PAYMENT_PENDING) {
      return updatePendingRegistrationFromOrphanPayment(order, order.registrationId, input, {
        playerPhotoPath: files.playerPhotoPath,
        idProofPath: files.idProofPath,
      });
    }
  }

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
  if (existingOrderReg && existingOrderReg.id !== order.registrationId) {
    return { ok: false, error: "This Razorpay payment is already linked to a registration." };
  }

  if (input.trialZoneId?.trim()) {
    const zone = await findPublishedTrialZone(input.trialZoneId.trim());
    if (!zone) return { ok: false, error: "Please select a valid published trial zone." };
  }

  if (!files?.playerPhotoPath?.trim()) {
    return { ok: false, error: "Player photo is required." };
  }

  const registration = await withDbRetry(() =>
    prisma.$transaction(async (tx) => {
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
    }),
  );

  await linkPaymentOrderToRegistration(order.razorpayOrderId, order.razorpayPaymentId!, registration.id);

  const emailSent = await sendEnrollmentEmail(registration);

  return { ok: true, registration, emailSent };
}
