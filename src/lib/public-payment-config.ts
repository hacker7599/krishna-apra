import { TRIAL_FEE_INR } from "@/lib/league";
import { getPaymentMode } from "@/lib/payment-mode-config";
import { getPaymentQrPath } from "@/lib/payment-qr-config";
import { getRazorpayPublicKeyId, isRazorpayConfigured, TRIAL_FEE_PAISE } from "@/lib/razorpay-config";

export type PublicPaymentConfig = {
  paymentMode: "razorpay" | "qr_upload";
  razorpayEnabled: boolean;
  keyId?: string;
  amountPaise?: number;
  amountInr: number;
  currency: string;
  qrImageUrl: string | null;
};

/** Server-side payment mode for /register (avoids wrong payment UI before client hydration). */
export async function getPublicPaymentConfig(): Promise<PublicPaymentConfig> {
  const mode = await getPaymentMode();

  if (mode === "razorpay" && isRazorpayConfigured()) {
    return {
      paymentMode: "razorpay",
      razorpayEnabled: true,
      keyId: getRazorpayPublicKeyId(),
      amountPaise: TRIAL_FEE_PAISE,
      amountInr: TRIAL_FEE_INR,
      currency: "INR",
      qrImageUrl: null,
    };
  }

  const paymentQrPath = await getPaymentQrPath();
  return {
    paymentMode: "qr_upload",
    razorpayEnabled: false,
    amountInr: TRIAL_FEE_INR,
    currency: "INR",
    qrImageUrl: paymentQrPath ? "/api/payments/qr-image" : null,
  };
}
