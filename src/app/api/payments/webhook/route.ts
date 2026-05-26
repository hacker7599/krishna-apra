import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logPaymentEvent } from "@/lib/payment-log";
import { finalizeRegistrationFromCapturedPayment } from "@/lib/finalize-registration-payment";
import { recordPaymentCapturedInDb } from "@/lib/payment-order-sync";
import { TRIAL_FEE_PAISE } from "@/lib/razorpay-config";
import { ensurePaymentCapturedOnRazorpay, verifyWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

type PaymentEntity = {
  id?: string;
  order_id?: string;
  status?: string;
  amount?: number;
  method?: string;
  email?: string;
  contact?: string;
};

type WebhookPayload = {
  event?: string;
  payload?: {
    payment?: { entity?: PaymentEntity };
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

async function syncCapturedPaymentFromWebhook(
  eventType: string,
  payment: PaymentEntity,
  eventId: string | undefined,
) {
  const orderId = payment.order_id;
  const paymentId = payment.id;
  const amountOk = payment.amount !== undefined && Number(payment.amount) === TRIAL_FEE_PAISE;

  if (!orderId || !paymentId || !amountOk) {
    await logPaymentEvent({
      source: "webhook",
      eventType,
      razorpayOrderId: orderId ?? null,
      razorpayPaymentId: paymentId ?? null,
      razorpayEventId: eventId ?? null,
      success: false,
      message: `${eventType} validation failed`,
      metadata: { status: payment.status, amount: payment.amount },
    });
    return;
  }

  const existing = await prisma.paymentOrder.findUnique({ where: { razorpayOrderId: orderId } });

  if (payment.status === "authorized") {
    const capture = await ensurePaymentCapturedOnRazorpay(orderId, paymentId);
    if (!capture.ok) {
      await logPaymentEvent({
        source: "webhook",
        eventType: `${eventType}.capture_pending`,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpayEventId: eventId ?? null,
        paymentOrderId: existing?.id,
        success: false,
        message: `capture not complete: ${capture.status}`,
      });
      return;
    }
  } else if (payment.status !== "captured") {
    await logPaymentEvent({
      source: "webhook",
      eventType,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpayEventId: eventId ?? null,
      success: false,
      message: `unexpected status: ${payment.status}`,
    });
    return;
  }

  await recordPaymentCapturedInDb({
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    source: "webhook",
    eventType,
    paymentMethod: payment.method,
    razorpayEventId: eventId ?? null,
    amountPaise: payment.amount ?? TRIAL_FEE_PAISE,
    email: payment.email ?? existing?.email,
    phone: payment.contact ? String(payment.contact) : existing?.phone,
    playerName: existing?.playerName,
  });

  await finalizeRegistrationFromCapturedPayment(orderId, paymentId);
}

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

  const payment = event.payload?.payment?.entity;

  if ((eventType === "payment.captured" || eventType === "payment.authorized") && payment) {
    await syncCapturedPaymentFromWebhook(eventType, payment, eventId);
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
