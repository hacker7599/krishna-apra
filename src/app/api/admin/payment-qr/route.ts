import { unlink } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getPaymentQrPath, setPaymentQrPath } from "@/lib/payment-qr-config";
import { requireAdmin, requireAdminMutation } from "@/lib/require-admin";
import { savePaymentQr } from "@/lib/save-upload";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const paymentQrPath = await getPaymentQrPath();
  return NextResponse.json({
    paymentQrPath,
    qrImageUrl: paymentQrPath ? "/api/payments/qr-image" : null,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });
  }

  const form = await req.formData();
  const file = form.get("qrImage");
  if (!file || typeof file === "string" || file.size === 0) {
    return NextResponse.json({ error: "QR image is required." }, { status: 400 });
  }

  try {
    const current = await getPaymentQrPath();
    const saved = await savePaymentQr(file as File);
    await setPaymentQrPath(saved);

    if (current?.startsWith("payment-qr/")) {
      const full = path.join(process.cwd(), "uploads", current.replace(/\\/g, "/"));
      void unlink(full).catch(() => undefined);
    }

    return NextResponse.json({ ok: true, paymentQrPath: saved, qrImageUrl: "/api/payments/qr-image" });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    const error =
      code === "FILE_TOO_LARGE"
        ? "QR image must be under 4 MB."
        : code === "FILE_TYPE"
          ? "QR image must be JPG, PNG, or WebP."
          : "Could not upload QR image.";
    return NextResponse.json({ error }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });
  }
  const current = await getPaymentQrPath();
  await setPaymentQrPath(null);
  if (current?.startsWith("payment-qr/")) {
    const full = path.join(process.cwd(), "uploads", current.replace(/\\/g, "/"));
    void unlink(full).catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}
