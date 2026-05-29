import { NextResponse } from "next/server";
import { getPublicPaymentConfig } from "@/lib/public-payment-config";
import { isRazorpayConfigured } from "@/lib/razorpay-config";

export const runtime = "nodejs";

export async function GET() {
  const config = await getPublicPaymentConfig();
  return NextResponse.json({
    enabled: config.razorpayEnabled,
    paymentMode: config.paymentMode,
    keyId: config.keyId,
    amountPaise: config.amountPaise,
    amountInr: config.amountInr,
    currency: config.currency,
    qrImageUrl: config.qrImageUrl,
    razorpayAvailable: isRazorpayConfigured(),
  });
}
