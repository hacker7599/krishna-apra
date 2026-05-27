import { NextResponse } from "next/server";
import { TRIAL_FEE_INR } from "@/lib/league";
import { getPaymentQrPath } from "@/lib/payment-qr-config";

export const runtime = "nodejs";

export async function GET() {
  const paymentQrPath = await getPaymentQrPath();
  return NextResponse.json({
    enabled: false,
    amountInr: TRIAL_FEE_INR,
    currency: "INR",
    paymentMode: "qr_upload",
    qrImageUrl: paymentQrPath ? "/api/payments/qr-image" : null,
  });
}
