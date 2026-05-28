import { prisma } from "@/lib/prisma";
import { isRazorpayConfigured } from "@/lib/razorpay-config";

export type PublicPaymentMode = "razorpay" | "qr_upload";

function assertAppConfigDelegate(): void {
  const delegate = (prisma as unknown as { appConfig?: { findUnique?: unknown } }).appConfig;
  if (typeof delegate?.findUnique === "function") return;
  throw new Error(
    "Database client is out of date after a schema change. Run: npx prisma generate && npx prisma db push — then restart the dev server.",
  );
}

export async function getPaymentMode(): Promise<PublicPaymentMode> {
  assertAppConfigDelegate();
  const row = await prisma.appConfig.findUnique({ where: { id: "default" } });
  const stored = row?.paymentMode;
  if (stored === "qr_upload" || stored === "razorpay") return stored;
  return isRazorpayConfigured() ? "razorpay" : "qr_upload";
}

export async function setPaymentMode(mode: PublicPaymentMode): Promise<void> {
  assertAppConfigDelegate();
  if (mode === "razorpay" && !isRazorpayConfigured()) {
    throw new Error("Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env first.");
  }
  await prisma.appConfig.upsert({
    where: { id: "default" },
    update: { paymentMode: mode },
    create: { id: "default", paymentMode: mode },
  });
}
