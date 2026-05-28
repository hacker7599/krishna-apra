import type { Registration } from "@prisma/client";
import { logPaymentEvent } from "@/lib/payment-log";
import { prisma } from "@/lib/prisma";
import { REGISTRATION_PAYMENT_PAID, REGISTRATION_PAYMENT_PENDING } from "@/lib/registration-payment-status";
import { resendRegistrationConfirmationEmail } from "@/lib/resend-registration-confirmation";
import { TRIAL_FEE_PAISE } from "@/lib/razorpay-config";

export type PaymentDecision = "approve" | "disapprove";

export async function applyRegistrationPaymentDecision(
  registration: Registration,
  decision: PaymentDecision,
  clientIp?: string,
): Promise<{ registration: Registration; emailSent: boolean; emailError?: string }> {
  const wasPaid = registration.paymentStatus === REGISTRATION_PAYMENT_PAID;
  const nextStatus = decision === "approve" ? REGISTRATION_PAYMENT_PAID : "refunded";

  const updated = await prisma.registration.update({
    where: { id: registration.id },
    data: { paymentStatus: nextStatus },
  });

  const paymentMethod =
    registration.razorpayPaymentId || registration.razorpayOrderId
      ? "razorpay"
      : registration.paymentProofPath
        ? "qr_upload"
        : "manual";

  await logPaymentEvent({
    source: "admin",
    eventType: decision === "approve" ? "payment_approved" : "payment_disapproved",
    razorpayOrderId: registration.razorpayOrderId,
    razorpayPaymentId: registration.razorpayPaymentId ?? registration.transactionRef,
    amountPaise: TRIAL_FEE_PAISE,
    currency: "INR",
    status: nextStatus,
    email: registration.email,
    phone: registration.phone,
    playerName: registration.playerName,
    registrationId: registration.id,
    clientIp,
    success: true,
    message:
      decision === "approve"
        ? `Payment marked received (${paymentMethod})`
        : "Payment marked disapproved",
    metadata: {
      paymentMethod,
      transactionRef: registration.transactionRef,
    },
  });

  let emailSent = false;
  let emailError: string | undefined;
  if (decision === "approve" && !wasPaid) {
    const email = await resendRegistrationConfirmationEmail(updated);
    emailSent = email.sent;
    emailError = email.error;
  }

  return { registration: updated, emailSent, emailError };
}

/** True when admin can mark this row as payment received. */
export function canApproveRegistrationPayment(status: string | null | undefined): boolean {
  return (
    status === REGISTRATION_PAYMENT_PENDING ||
    status === "pending" ||
    status === "refunded"
  );
}
