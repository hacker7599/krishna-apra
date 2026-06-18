import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { assertRegistrationOpenApi } from "@/lib/registration-api-guard";
import { createPaymentInviteByPhone } from "@/lib/registration-payment-invite";
import { getClientIp } from "@/lib/get-client-ip";
import { checkRegisterPostRate } from "@/lib/register-rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  phone: z.string().trim().min(8).max(20),
});

export async function POST(req: NextRequest) {
  const closed = assertRegistrationOpenApi();
  if (closed) return closed;

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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });
  }

  const result = await createPaymentInviteByPhone(parsed.data.phone);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    paymentUrl: result.paymentUrl,
  });
}
