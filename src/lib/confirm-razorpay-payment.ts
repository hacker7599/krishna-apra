import { prisma } from "@/lib/prisma";
import { logPaymentEvent } from "@/lib/payment-log";
import { paymentOrderMatchesRegistrant, paymentOrderMismatchMessage } from "@/lib/payment-order-match";
import { TRIAL_FEE_PAISE } from "@/lib/razorpay-config";
import { recordPaymentCapturedInDb } from "@/lib/payment-order-sync";
import { ensurePaymentCapturedOnRazorpay, isOrderPaidOnRazorpay, verifyPaymentSignature } from "@/lib/razorpay";

export type RazorpayPaymentProof = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type RegistrantIdentity = {
  email: string;
  phone: string;
  playerName: string;
};

export async function confirmRazorpayPayment(
  proof: RazorpayPaymentProof,
  registrant: RegistrantIdentity,
  clientIp?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = proof;

  if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    await logPaymentEvent({
      source: "register",
      eventType: "signature_invalid",
      razorpayOrderId,
      razorpayPaymentId,
      clientIp,
      success: false,
      message: "HMAC verification failed",
    });
    return {
      ok: false,
      error: "Payment could not be verified. No registration was created. Please try the payment again.",
    };
  }

  const existingReg = await prisma.registration.findUnique({ where: { razorpayOrderId } });
  if (existingReg) {
    return { ok: false, error: "This payment has already been used for a registration." };
  }

  const order = await prisma.paymentOrder.findUnique({ where: { razorpayOrderId } });
  if (!order) {
    await logPaymentEvent({
      source: "register",
      eventType: "order_not_found",
      razorpayOrderId,
      razorpayPaymentId,
      clientIp,
      success: false,
    });
    return { ok: false, error: "Payment order not found. Please try paying again." };
  }
  if (order.registrationId) {
    return { ok: false, error: "This payment has already been used for a registration." };
  }

  if (!paymentOrderMatchesRegistrant(order, registrant)) {
    await logPaymentEvent({
      source: "register",
      eventType: "identity_mismatch",
      razorpayOrderId,
      razorpayPaymentId,
      paymentOrderId: order.id,
      email: registrant.email,
      phone: registrant.phone,
      playerName: registrant.playerName,
      clientIp,
      success: false,
      message: "Registrant does not match payment order",
    });
    return { ok: false, error: paymentOrderMismatchMessage() };
  }

  if (order.amountPaise !== TRIAL_FEE_PAISE) {
    return { ok: false, error: "Payment amount does not match the trial registration fee." };
  }

  let paid = order.status === "paid" && order.razorpayPaymentId === razorpayPaymentId;
  if (!paid) {
    try {
      const capture = await ensurePaymentCapturedOnRazorpay(razorpayOrderId, razorpayPaymentId);
      if (!capture.ok) {
        paid = await isOrderPaidOnRazorpay(razorpayOrderId, razorpayPaymentId);
      } else {
        paid = true;
      }
    } catch (e) {
      console.error(e);
      return { ok: false, error: "Could not confirm payment with Razorpay. Please try again in a few minutes." };
    }
  }

  if (!paid) {
    return {
      ok: false,
      error: "Payment was not successful. No registration was created. Please complete payment and try again.",
    };
  }

  await recordPaymentCapturedInDb({
    razorpayOrderId,
    razorpayPaymentId,
    source: "register",
    eventType: "payment_confirmed",
    email: registrant.email,
    phone: registrant.phone,
    playerName: registrant.playerName,
    amountPaise: order.amountPaise,
  });

  return { ok: true };
}

export async function linkPaymentOrderToRegistration(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  registrationId: string,
): Promise<void> {
  const order = await prisma.paymentOrder.findUnique({ where: { razorpayOrderId } });
  await prisma.paymentOrder.updateMany({
    where: { razorpayOrderId },
    data: { registrationId, status: "paid", razorpayPaymentId },
  });
  await logPaymentEvent({
    source: "register",
    eventType: "linked_to_registration",
    razorpayOrderId,
    razorpayPaymentId,
    registrationId,
    paymentOrderId: order?.id,
    success: true,
  });
}
