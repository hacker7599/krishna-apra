import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/get-client-ip";
import { attachRegistrationReceiptCookie } from "@/lib/registration-receipt-cookie";
import { checkOtpVerifyRate } from "@/lib/registration-status-rate-limit";
import { signRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { verifyRegistrationOtp } from "@/lib/registration-otp";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email().max(200),
  otp: z.string().min(6).max(8),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your email and 6-digit code." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const limited = await checkOtpVerifyRate(ip, email);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait and try again." }, { status: 429 });
  }

  const verified = await verifyRegistrationOtp(email, parsed.data.otp);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 401 });
  }

  let receiptToken: string;
  try {
    receiptToken = await signRegistrationConfirmationToken(verified.registrationId);
  } catch {
    return NextResponse.json({ error: "Could not issue receipt access. Contact the league desk." }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true });
  attachRegistrationReceiptCookie(res, receiptToken, req);
  return res;
}
