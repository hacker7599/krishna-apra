import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/get-client-ip";
import { normalizePhone } from "@/lib/normalize-phone";
import { logPaymentEvent } from "@/lib/payment-log";
import { checkRegisterPostRate } from "@/lib/register-rate-limit";
import { getRazorpayPublicKeyId, isRazorpayConfigured, TRIAL_FEE_PAISE } from "@/lib/razorpay-config";
import { getRazorpay } from "@/lib/razorpay";
import { LEAGUE_NAME } from "@/lib/league";
import { duplicateRegistrationMessage, findExistingRegistration } from "@/lib/registration-duplicate";

export const runtime = "nodejs";

const bodySchema = z.object({
  playerName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(10).max(18),
});

export async function POST(req: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Online payment is not available. Use manual payment proof instead." }, { status: 503 });
  }

  const ip = getClientIp(req);
  const limited = checkRegisterPostRate(ip);
  if (!limited.allowed) {
    const res = NextResponse.json(
      { error: "Too many attempts from this network. Please try again later.", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
    );
    res.headers.set("Retry-After", String(limited.retryAfterSec));
    return res;
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter player name, email, and phone before paying." }, { status: 400 });
  }

  const emailNorm = parsed.data.email.toLowerCase();
  const phoneNorm = normalizePhone(parsed.data.phone);

  const existing = await findExistingRegistration(emailNorm, phoneNorm);
  if (existing) {
    return NextResponse.json({ error: duplicateRegistrationMessage(existing), duplicate: true }, { status: 409 });
  }

  try {
    const rzp = getRazorpay();
    const receipt = `fsu15_${Date.now().toString(36)}`;
    const order = await rzp.orders.create({
      amount: TRIAL_FEE_PAISE,
      currency: "INR",
      receipt,
      notes: {
        playerName: parsed.data.playerName,
        email: emailNorm,
        phone: phoneNorm,
      },
    });

    const paymentOrder = await prisma.paymentOrder.create({
      data: {
        razorpayOrderId: order.id,
        amountPaise: TRIAL_FEE_PAISE,
        currency: "INR",
        email: emailNorm,
        phone: phoneNorm,
        playerName: parsed.data.playerName,
        receipt,
      },
    });

    await logPaymentEvent({
      source: "create_order",
      eventType: "order.created",
      razorpayOrderId: order.id,
      amountPaise: TRIAL_FEE_PAISE,
      currency: "INR",
      status: "created",
      email: emailNorm,
      phone: phoneNorm,
      playerName: parsed.data.playerName,
      paymentOrderId: paymentOrder.id,
      clientIp: ip,
      metadata: { receipt },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayPublicKeyId(),
      name: LEAGUE_NAME,
    });
  } catch (e) {
    console.error(e);
    await logPaymentEvent({
      source: "create_order",
      eventType: "order.failed",
      clientIp: ip,
      success: false,
      message: e instanceof Error ? e.message : "unknown",
    });
    return NextResponse.json({ error: "Could not start payment. Please try again or contact the league desk." }, { status: 500 });
  }
}
