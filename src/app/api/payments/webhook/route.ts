import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logPaymentEvent } from "@/lib/payment-log";
import { finalizeRegistrationFromCapturedPayment } from "@/lib/finalize-registration-payment";
import { recordPaymentCapturedInDb } from "@/lib/payment-order-sync";
import { TRIAL_FEE_PAISE } from "@/lib/razorpay-config";
import { ensurePaymentCapturedOnRazorpay, verifyWebhookSignature } from "@/lib/razorpay";
import { isTransientDbError } from "@/lib/db-resilience";

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

type WebhookSyncResult = "ok" | "retry" | "ignored";

async function syncCapturedPaymentFromWebhook(
  eventType: string,
  payment: PaymentEntity,
): Promise<WebhookSyncResult> {
  const orderId = payment.order_id;
  const paymentId = payment.id;
  const amountOk = payment.amount !== undefined && Number(payment.amount) === TRIAL_FEE_PAISE;

  if (!orderId || !paymentId || !amountOk) {
    await logPaymentEvent({
      source: "webhook",
      eventType,
      razorpayOrderId: orderId ?? null,
      razorpayPaymentId: paymentId ?? null,
      success: false,
      message: `${eventType} validation failed`,
      metadata: { status: payment.status, amount: payment.amount },
    });
    return "ignored";
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
        paymentOrderId: existing?.id,
        success: false,
        message: `capture not complete: ${capture.status}`,
      });
      return "retry";
    }
  } else if (payment.status !== "captured") {
    await logPaymentEvent({
      source: "webhook",
      eventType,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      success: false,
      message: `unexpected status: ${payment.status}`,
    });
    return "ignored";
  }

  let recorded: Awaited<ReturnType<typeof recordPaymentCapturedInDb>>;
  try {
    recorded = await recordPaymentCapturedInDb({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      source: "webhook",
      eventType,
      paymentMethod: payment.method,
      amountPaise: payment.amount ?? TRIAL_FEE_PAISE,
      email: payment.email ?? existing?.email,
      phone: payment.contact ? String(payment.contact) : existing?.phone,
      playerName: existing?.playerName,
    });
  } catch (error) {
    if (isTransientDbError(error)) {
      return "retry";
    }
    throw error;
  }

  if (!recorded.ok) {
    await logPaymentEvent({
      source: "webhook",
      eventType: `${eventType}.order_missing`,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      success: false,
      message: recorded.reason,
    });
    return recorded.reason === "order_not_found" ? "retry" : "ignored";
  }

  let finalized: Awaited<ReturnType<typeof finalizeRegistrationFromCapturedPayment>>;
  try {
    finalized = await finalizeRegistrationFromCapturedPayment(orderId, paymentId);
  } catch (error) {
    if (isTransientDbError(error)) {
      return "retry";
    }
    throw error;
  }

  if (!finalized.ok) {
    if (finalized.reason === "no_registration_link" || finalized.reason === "not_pending") {
      return "ok";
    }
    if (finalized.reason === "registration_not_found") {
      return "retry";
    }
    await logPaymentEvent({
      source: "webhook",
      eventType: `${eventType}.finalize_pending`,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      paymentOrderId: recorded.paymentOrderId,
      success: false,
      message: finalized.reason,
    });
    return "retry";
  }

  return "ok";
}

async function logWebhookEventProcessed(eventId: string, eventType: string): Promise<void> {
  await logPaymentEvent({
    source: "webhook",
    eventType: `${eventType}.processed`,
    razorpayEventId: eventId,
    success: true,
    message: "processed",
  });
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
    if (dup?.success) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  const payment = event.payload?.payment?.entity;
  let syncResult: WebhookSyncResult = "ok";

  if ((eventType === "payment.captured" || eventType === "payment.authorized") && payment) {
    syncResult = await syncCapturedPaymentFromWebhook(eventType, payment);
  } else {
    await logPaymentEvent({
      source: "webhook",
      eventType,
      success: true,
      message: "acknowledged",
      metadata: { event: eventType },
    });
    if (eventId) {
      await logWebhookEventProcessed(eventId, eventType);
    }
    return NextResponse.json({ ok: true });
  }

  if (syncResult === "retry") {
    return NextResponse.json({ error: "Processing incomplete; retry later." }, { status: 500 });
  }

  if (eventId && syncResult === "ok") {
    await logWebhookEventProcessed(eventId, eventType);
  }

  return NextResponse.json({ ok: true });
}
