import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/get-client-ip";
import { recordCheckoutAbandonment } from "@/lib/record-checkout-abandonment";
import { checkRateLimit } from "@/lib/rate-limit-db";
import { jsonFromDbError } from "@/lib/db-http-error";

export const runtime = "nodejs";

const bodySchema = z.object({
  registrationId: z.string().trim().min(1),
  razorpayOrderId: z.string().trim().min(1),
  event: z.enum(["dismissed", "payment_failed"]),
  message: z.string().trim().max(500).optional(),
});

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 40;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = await checkRateLimit(`checkout-event:ip:${ip}`, MAX_PER_WINDOW, WINDOW_MS);
  if (!limited.allowed) {
    const res = NextResponse.json(
      { error: "Too many requests. Please try again later.", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
    );
    res.headers.set("Retry-After", String(limited.retryAfterSec));
    return res;
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await recordCheckoutAbandonment({
      registrationId: parsed.data.registrationId,
      razorpayOrderId: parsed.data.razorpayOrderId,
      reason: parsed.data.event,
      message: parsed.data.message,
      clientIp: ip,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ok: true, alreadyPaid: result.alreadyPaid === true });
  } catch (e) {
    console.error(e);
    return jsonFromDbError(e, "Could not record checkout event.");
  }
}
