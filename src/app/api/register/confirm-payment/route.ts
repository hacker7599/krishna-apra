import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/get-client-ip";
import {
  finalizeRegistrationAfterPayment,
  registrationSuccessResponse,
} from "@/lib/finalize-registration-payment";
import { prisma } from "@/lib/prisma";
import { jsonFromDbError } from "@/lib/db-http-error";
import { checkRegisterPostRate } from "@/lib/register-rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  registrationId: z.string().trim().min(1),
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payment confirmation data is incomplete." }, { status: 400 });
  }

  try {
    const registration = await prisma.registration.findUnique({
      where: { id: parsed.data.registrationId },
    });
    if (!registration) {
      return NextResponse.json({ error: "Registration not found. Please submit the form again." }, { status: 404 });
    }

    const result = await finalizeRegistrationAfterPayment(
      parsed.data.registrationId,
      {
        razorpayOrderId: parsed.data.razorpayOrderId,
        razorpayPaymentId: parsed.data.razorpayPaymentId,
        razorpaySignature: parsed.data.razorpaySignature,
      },
      {
        email: registration.email,
        phone: registration.phone,
        playerName: registration.playerName,
      },
      ip,
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return registrationSuccessResponse(req, result.registration.id, result.emailSent);
  } catch (e) {
    console.error(e);
    return jsonFromDbError(e, "Could not confirm your payment. Please try again or contact the league desk.");
  }
}
