import { prisma } from "@/lib/prisma";
import { logPaymentEvent } from "@/lib/payment-log";
import { withDbRetry } from "@/lib/db-resilience";

/** Mark a local payment order as paid after Razorpay confirms capture. */
export async function recordPaymentCapturedInDb(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  source: "create_order" | "webhook" | "register" | "admin";
  eventType: string;
  paymentMethod?: string;
  razorpayEventId?: string | null;
  amountPaise?: number;
  email?: string | null;
  phone?: string | null;
  playerName?: string | null;
}): Promise<{ ok: true; paymentOrderId?: string } | { ok: false; reason: string }> {
  return withDbRetry(async () => {
    const existing = await prisma.paymentOrder.findUnique({
      where: { razorpayOrderId: params.razorpayOrderId },
    });
    if (!existing) {
      return { ok: false as const, reason: "order_not_found" };
    }

    await prisma.paymentOrder.updateMany({
      where: { razorpayOrderId: params.razorpayOrderId },
      data: {
        status: "paid",
        razorpayPaymentId: params.razorpayPaymentId,
        paidAt: existing.paidAt ?? new Date(),
        paymentMethod: params.paymentMethod ?? existing.paymentMethod ?? undefined,
      },
    });

    await logPaymentEvent({
      source: params.source,
      eventType: params.eventType,
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      razorpayEventId: params.razorpayEventId ?? null,
      amountPaise: params.amountPaise ?? existing.amountPaise,
      currency: existing.currency,
      status: "paid",
      paymentOrderId: existing.id,
      email: params.email ?? existing.email,
      phone: params.phone ?? existing.phone,
      playerName: params.playerName ?? existing.playerName,
      success: true,
      metadata: params.paymentMethod ? { method: params.paymentMethod } : undefined,
    });

    return { ok: true as const, paymentOrderId: existing.id };
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
