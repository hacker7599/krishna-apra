import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { logAdminAudit } from "@/lib/admin-audit";
import { getClientIp } from "@/lib/get-client-ip";
import { getPaymentQrPath } from "@/lib/payment-qr-config";
import { getPaymentMode, setPaymentMode, type PublicPaymentMode } from "@/lib/payment-mode-config";
import { requireAdmin, requireAdminMutation } from "@/lib/require-admin";
import { isRazorpayConfigured } from "@/lib/razorpay-config";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [paymentMode, paymentQrPath] = await Promise.all([getPaymentMode(), getPaymentQrPath()]);

  return NextResponse.json({
    paymentMode,
    razorpayConfigured: isRazorpayConfigured(),
    qrImageUrl: paymentQrPath ? "/api/payments/qr-image" : null,
    paymentQrPath,
  });
}

const patchSchema = z.object({
  paymentMode: z.enum(["razorpay", "qr_upload"]),
});

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment mode." }, { status: 400 });
  }

  try {
    await setPaymentMode(parsed.data.paymentMode as PublicPaymentMode);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update payment mode.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await logAdminAudit({
    action: "update",
    entityType: "payment_settings",
    entityId: "default",
    summary: `Public registration payment mode set to ${parsed.data.paymentMode}`,
    clientIp: getClientIp(req),
  });

  const paymentQrPath = await getPaymentQrPath();
  return NextResponse.json({
    ok: true,
    paymentMode: parsed.data.paymentMode,
    razorpayConfigured: isRazorpayConfigured(),
    qrImageUrl: paymentQrPath ? "/api/payments/qr-image" : null,
  });
}
