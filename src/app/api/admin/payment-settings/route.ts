import { NextResponse } from "next/server";
import { getPaymentQrPath } from "@/lib/payment-qr-config";
import { getPaymentMode } from "@/lib/payment-mode-config";
import { requireAdmin } from "@/lib/require-admin";
import { isRazorpayConfigured } from "@/lib/razorpay-config";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [paymentMode, paymentQrPath] = await Promise.all([getPaymentMode(), getPaymentQrPath()]);

  return NextResponse.json({
    paymentMode,
    paymentModeSource: "env",
    razorpayConfigured: isRazorpayConfigured(),
    qrImageUrl: paymentQrPath ? "/api/payments/qr-image" : null,
    paymentQrPath,
  });
}
