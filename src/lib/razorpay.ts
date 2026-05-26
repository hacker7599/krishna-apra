import crypto from "crypto";
import Razorpay from "razorpay";
import { isRazorpayConfigured, TRIAL_FEE_PAISE } from "@/lib/razorpay-config";

export function getRazorpay(): Razorpay {
  if (!isRazorpayConfigured()) {
    throw new Error("RAZORPAY_NOT_CONFIGURED");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!.trim(),
    key_secret: process.env.RAZORPAY_KEY_SECRET!.trim(),
  });
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret || !orderId || !paymentId || !signature) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (expected.length !== signature.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8"));
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret || !rawBody || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected.length !== signature.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8"));
  } catch {
    return false;
  }
}

function paymentIsCaptured(payment: { status?: string; captured?: boolean }): boolean {
  return payment.status === "captured" || payment.captured === true;
}

/**
 * Ensures Razorpay payment is captured (auto-capture on order, or manual capture API if still authorized).
 */
export async function ensurePaymentCapturedOnRazorpay(
  razorpayOrderId: string,
  razorpayPaymentId: string,
): Promise<{ ok: true } | { ok: false; status: string }> {
  const rzp = getRazorpay();
  let payment = await rzp.payments.fetch(razorpayPaymentId);

  if (payment.order_id !== razorpayOrderId) {
    return { ok: false, status: "order_mismatch" };
  }
  if (Number(payment.amount) !== TRIAL_FEE_PAISE) {
    return { ok: false, status: "amount_mismatch" };
  }

  if (paymentIsCaptured(payment)) {
    return { ok: true };
  }

  if (payment.status === "authorized") {
    const currency = payment.currency || "INR";
    try {
      payment = await rzp.payments.capture(razorpayPaymentId, TRIAL_FEE_PAISE, currency);
    } catch {
      payment = await rzp.payments.fetch(razorpayPaymentId);
    }
  }

  if (paymentIsCaptured(payment)) {
    return { ok: true };
  }

  return { ok: false, status: payment.status ?? "unknown" };
}

/** Retries capture verification — handles webhook/authorize lag after checkout success. */
export async function isOrderPaidOnRazorpay(razorpayOrderId: string, razorpayPaymentId: string): Promise<boolean> {
  const delays = [0, 400, 900, 1800];
  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) {
      await new Promise((r) => setTimeout(r, delays[i]));
    }
    const result = await ensurePaymentCapturedOnRazorpay(razorpayOrderId, razorpayPaymentId);
    if (result.ok) return true;
    if (result.status === "order_mismatch" || result.status === "amount_mismatch") {
      return false;
    }
  }
  return false;
}
