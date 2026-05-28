import { NextResponse } from "next/server";
import { TRIAL_FEE_INR } from "@/lib/league";
import { getPaymentMode } from "@/lib/payment-mode-config";
import { getPaymentQrPath } from "@/lib/payment-qr-config";
import { getRazorpayPublicKeyId, isRazorpayConfigured, TRIAL_FEE_PAISE } from "@/lib/razorpay-config";

export const runtime = "nodejs";

export async function GET() {
  const mode = await getPaymentMode();

  if (mode === "razorpay" && isRazorpayConfigured()) {
    return NextResponse.json({
      enabled: true,
      paymentMode: "razorpay",
      keyId: getRazorpayPublicKeyId(),
      amountPaise: TRIAL_FEE_PAISE,
      amountInr: TRIAL_FEE_INR,
      currency: "INR",
      qrImageUrl: null,
    });
  }

  const paymentQrPath = await getPaymentQrPath();
  return NextResponse.json({
    enabled: false,
    paymentMode: "qr_upload",
    amountInr: TRIAL_FEE_INR,
    currency: "INR",
    qrImageUrl: paymentQrPath ? "/api/payments/qr-image" : null,
    razorpayAvailable: isRazorpayConfigured(),
  });
}
