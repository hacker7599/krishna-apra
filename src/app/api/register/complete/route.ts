import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCompletionInvitePayload, submitRegistrationViaCompletionInvite } from "@/lib/complete-registration-via-invite";
import { getClientIp } from "@/lib/get-client-ip";
import { checkRegisterPostRate } from "@/lib/register-rate-limit";
import { attachRegistrationReceiptCookie } from "@/lib/registration-receipt-cookie";
import { jsonFromDbError } from "@/lib/db-http-error";
import { signRegistrationConfirmationToken } from "@/lib/registration-confirm-token";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Missing completion link token." }, { status: 400 });
  }

  try {
    const payload = await getCompletionInvitePayload(token);
    if (!("ok" in payload) || !payload.ok) {
      const err = payload as { error: string; status: number };
      return NextResponse.json({ error: err.error }, { status: err.status });
    }

    return NextResponse.json({
    playerName: payload.playerName,
    email: payload.email,
    phone: payload.phone,
    amountInr: payload.amountInr,
    paidAt: payload.paidAt,
    prefill: payload.prefill,
    lockedFields: payload.lockedFields,
    });
  } catch (e) {
    console.error(e);
    return jsonFromDbError(e, "Could not load your completion form. Please try again.");
  }
}

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

  const token = new URL(req.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Missing completion link token." }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  try {
    const result = await submitRegistrationViaCompletionInvite(token, form);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const confirmationToken = await signRegistrationConfirmationToken(result.registrationId);
    const res = NextResponse.json({
      ok: true,
      registrationId: result.registrationId,
      emailSent: result.emailSent,
    });
    attachRegistrationReceiptCookie(res, confirmationToken, req);
    return res;
  } catch (e) {
    console.error(e);
    return jsonFromDbError(e, "Could not submit your registration. Please try again.");
  }
}
