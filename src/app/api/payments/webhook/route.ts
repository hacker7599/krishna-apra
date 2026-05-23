import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logPaymentEvent } from "@/lib/payment-log";
import { TRIAL_FEE_PAISE } from "@/lib/razorpay-config";
import { verifyWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

type WebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
        amount?: number;
        method?: string;
        email?: string;
        contact?: string;
      };
    };
    order?: {
      entity?: {
        id?: string;
        amount?: number;
        status?: string;
        receipt?: string;
      };
    };
  };
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const eventId = req.headers.get("x-razorpay-event-id") ?? undefined;

  if (!process.env.RAZORPAY_WEBHOOK_SECRET?.trim()) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    await logPaymentEvent({
      source: "webhook",
      eventType: "signature_invalid",
      razorpayEventId: eventId ?? null,
      success: false,
    });
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: WebhookPayload;
  try {
    event = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventType = event.event ?? "unknown";

  if (eventId) {
    const dup = await prisma.paymentLog.findUnique({ where: { razorpayEventId: eventId } });
    if (dup) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  if (eventType === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.order_id;
    const paymentId = payment?.id;
    const amountOk =
      payment?.amount !== undefined && Number(payment.amount) === TRIAL_FEE_PAISE;

    if (orderId && paymentId && payment?.status === "captured" && amountOk) {
      const existing = await prisma.paymentOrder.findUnique({ where: { razorpayOrderId: orderId } });
      await prisma.paymentOrder.updateMany({
        where: { razorpayOrderId: orderId },
        data: {
          status: "paid",
          razorpayPaymentId: paymentId,
          paidAt: new Date(),
          paymentMethod: payment.method ?? undefined,
        },
      });

      await logPaymentEvent({
        source: "webhook",
        eventType,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpayEventId: eventId ?? null,
        amountPaise: payment.amount ?? TRIAL_FEE_PAISE,
        currency: "INR",
        status: "paid",
        paymentOrderId: existing?.id,
        email: payment.email ?? existing?.email,
        phone: payment.contact ? String(payment.contact) : existing?.phone,
        playerName: existing?.playerName,
        success: true,
        metadata: { method: payment.method },
      });
    } else {
      await logPaymentEvent({
        source: "webhook",
        eventType,
        razorpayOrderId: orderId ?? null,
        razorpayPaymentId: paymentId ?? null,
        razorpayEventId: eventId ?? null,
        success: false,
        message: "payment.captured validation failed",
        metadata: { status: payment?.status, amount: payment?.amount },
      });
    }
  } else {
    await logPaymentEvent({
      source: "webhook",
      eventType,
      razorpayEventId: eventId ?? null,
      success: true,
      message: "acknowledged",
      metadata: { event: eventType },
    });
  }

  return NextResponse.json({ ok: true });
}
