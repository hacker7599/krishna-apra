import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/get-client-ip";
import { preparePaymentForRegistrationInvite } from "@/lib/prepare-payment-for-registration";
import { checkRegisterPostRate } from "@/lib/register-rate-limit";
import { getPublicPaymentConfig } from "@/lib/public-payment-config";

export const runtime = "nodejs";

const bodySchema = z.object({
  token: z.string().trim().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = await checkRegisterPostRate(ip);
  if (!limited.allowed) {
    const res = NextResponse.json(
      { error: "Too many attempts. Please try again later.", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
    );
    res.headers.set("Retry-After", String(limited.retryAfterSec));
    return res;
  }

  const paymentConfig = await getPublicPaymentConfig();
  if (!paymentConfig.razorpayEnabled) {
    return NextResponse.json(
      {
        error:
          paymentConfig.paymentMode === "qr_upload"
            ? "Online payment is not active. Use the QR option on the registration page or contact the league desk."
            : "Online payment is temporarily unavailable. Please try again later.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "This payment link is invalid." }, { status: 400 });
  }

  const prepared = await preparePaymentForRegistrationInvite(parsed.data.token, ip);
  if (!prepared.ok) {
    return NextResponse.json({ error: prepared.error }, { status: prepared.status });
  }

  return NextResponse.json(prepared);
}
