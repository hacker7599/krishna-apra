import { prisma } from "@/lib/prisma";
import { logPaymentEvent } from "@/lib/payment-log";
import { withDbRetry } from "@/lib/db-resilience";

export type CheckoutAbandonReason = "dismissed" | "payment_failed";

export async function recordCheckoutAbandonment(params: {
  registrationId: string;
  razorpayOrderId: string;
  reason: CheckoutAbandonReason;
  message?: string;
  clientIp?: string;
}): Promise<{ ok: true; alreadyPaid?: boolean } | { ok: false; error: string; status: number }> {
  const registration = await prisma.registration.findUnique({
    where: { id: params.registrationId },
    select: {
      id: true,
      email: true,
      phone: true,
      playerName: true,
      paymentStatus: true,
      paymentProofPath: true,
      razorpayOrderId: true,
    },
  });

  if (!registration) {
    return { ok: false, error: "Registration not found.", status: 404 };
  }

  if (registration.razorpayOrderId !== params.razorpayOrderId) {
    return { ok: false, error: "Order does not match this registration.", status: 400 };
  }

  const order = await prisma.paymentOrder.findUnique({
    where: { razorpayOrderId: params.razorpayOrderId },
  });

  if (!order) {
    return { ok: false, error: "Payment order not found.", status: 404 };
  }

  if (order.registrationId && order.registrationId !== registration.id) {
    return { ok: false, error: "Order is linked to a different registration.", status: 400 };
  }

  if (order.status === "paid") {
    return { ok: true, alreadyPaid: true };
  }

  const eventType = params.reason === "dismissed" ? "checkout.dismissed" : "checkout.payment_failed";
  const logMessage =
    params.message?.trim() ||
    (params.reason === "dismissed"
      ? "User closed Razorpay checkout without paying."
      : "Razorpay reported payment failure.");

  await withDbRetry(() =>
    prisma.paymentOrder.updateMany({
      where: { razorpayOrderId: params.razorpayOrderId, status: { not: "paid" } },
      data: { status: "failed" },
    }),
  );

  await logPaymentEvent({
    source: "checkout_client",
    eventType,
    razorpayOrderId: params.razorpayOrderId,
    amountPaise: order.amountPaise,
    currency: order.currency,
    status: "failed",
    email: registration.email,
    phone: registration.phone,
    playerName: registration.playerName,
    registrationId: registration.id,
    paymentOrderId: order.id,
    clientIp: params.clientIp,
    success: false,
    message: logMessage,
    metadata: {
      registrationPaymentStatus: registration.paymentStatus,
      hadPaymentProof: Boolean(registration.paymentProofPath),
    },
  });

  return { ok: true };
}

export { isRazorpayAbandonedRegistration, razorpayAbandonedLabel } from "@/lib/razorpay-checkout-admin";
