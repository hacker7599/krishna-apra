import { prisma } from "@/lib/prisma";

export type PaymentLogInput = {
  source: "create_order" | "webhook" | "register" | "admin" | "prepare_registration";
  eventType: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpayEventId?: string | null;
  amountPaise?: number | null;
  currency?: string | null;
  status?: string | null;
  email?: string | null;
  phone?: string | null;
  playerName?: string | null;
  registrationId?: string | null;
  paymentOrderId?: string | null;
  clientIp?: string | null;
  success?: boolean;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function logPaymentEvent(input: PaymentLogInput): Promise<void> {
  try {
    await prisma.paymentLog.create({
      data: {
        source: input.source,
        eventType: input.eventType,
        razorpayOrderId: input.razorpayOrderId ?? null,
        razorpayPaymentId: input.razorpayPaymentId ?? null,
        razorpayEventId: input.razorpayEventId ?? null,
        amountPaise: input.amountPaise ?? null,
        currency: input.currency ?? null,
        status: input.status ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        playerName: input.playerName ?? null,
        registrationId: input.registrationId ?? null,
        paymentOrderId: input.paymentOrderId ?? null,
        clientIp: input.clientIp ?? null,
        success: input.success ?? true,
        message: input.message ?? null,
        metadata: input.metadata ? JSON.stringify(sanitizeMetadata(input.metadata)) : null,
      },
    });
  } catch (e) {
    console.error("[payment-log]", e);
  }
}

function sanitizeMetadata(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    const key = k.toLowerCase();
    if (key.includes("card") || key.includes("vpa") || key.includes("token") || key.includes("secret")) continue;
    if (typeof v === "object" && v !== null) {
      out[k] = sanitizeMetadata(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}
