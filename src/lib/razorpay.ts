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

export async function isOrderPaidOnRazorpay(razorpayOrderId: string, razorpayPaymentId: string): Promise<boolean> {
  const rzp = getRazorpay();
  const payment = await rzp.payments.fetch(razorpayPaymentId);
  return (
    payment.order_id === razorpayOrderId &&
    payment.status === "captured" &&
    Number(payment.amount) === TRIAL_FEE_PAISE
  );
}
