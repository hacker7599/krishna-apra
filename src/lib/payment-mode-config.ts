import { isRazorpayConfigured } from "@/lib/razorpay-config";

export type PublicPaymentMode = "razorpay" | "qr_upload";

/** Controls /register checkout: Razorpay vs QR upload. Set in server .env only. */
export function getPublicPaymentModeFromEnv(): PublicPaymentMode {
  const raw = process.env.PUBLIC_PAYMENT_MODE?.trim().toLowerCase();
  if (raw === "qr_upload" || raw === "qr") return "qr_upload";
  if (raw === "razorpay") return "razorpay";
  return isRazorpayConfigured() ? "razorpay" : "qr_upload";
}

export async function getPaymentMode(): Promise<PublicPaymentMode> {
  return getPublicPaymentModeFromEnv();
}
