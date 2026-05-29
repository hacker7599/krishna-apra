import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/get-client-ip";
import { attachRegistrationReceiptCookie } from "@/lib/registration-receipt-cookie";
import { normalizeRegistrationCodeInput } from "@/lib/registration-codes";
import { prisma } from "@/lib/prisma";
import { signRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { toRegistrationConfirmation } from "@/lib/registration-confirmation";
import { checkOtpVerifyRate } from "@/lib/registration-status-rate-limit";
import { isEnrolledPaymentStatus, isPendingPaymentStatus } from "@/lib/registration-payment-status";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().email().max(200),
  registrationCode: z.string().trim().min(8).max(24),
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
    return NextResponse.json({ error: "Enter your email and registration code." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const registrationCode = normalizeRegistrationCodeInput(parsed.data.registrationCode);

  const limited = await checkOtpVerifyRate(ip, email);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait and try again." }, { status: 429 });
  }

  const row = await prisma.registration.findFirst({
    where: { email, registrationCode },
    include: { trialZone: { select: { trialPlace: true, zone: true } } },
  });

  if (!row) {
    return NextResponse.json(
      { error: "No registration found for this email and code. Check your receipt or confirmation email." },
      { status: 404 },
    );
  }

  const confirmation = toRegistrationConfirmation(row);
  const paid = isEnrolledPaymentStatus(row.paymentStatus);
  const pending = isPendingPaymentStatus(row.paymentStatus);

  let receiptToken: string | null = null;
  try {
    receiptToken = await signRegistrationConfirmationToken(row.id);
  } catch {
    receiptToken = null;
  }

  const res = NextResponse.json({
    ok: true,
    playerName: row.playerName,
    paymentStatus: row.paymentStatus,
    paid,
    pending,
    registrationCode: row.registrationCode,
    paymentCode: row.paymentCode,
    summary: paid
      ? "Your trial fee is confirmed. You can open your printable receipt below."
      : pending
        ? row.paymentProofPath
          ? "Your registration is submitted. Payment proof is awaiting league desk verification."
          : "Your registration is saved. Complete payment on the registration form or contact the league desk."
        : "Contact the league desk for help with this registration.",
    confirmation: {
      playerName: confirmation.playerName,
      paymentStatus: confirmation.payment.status,
      paymentMethod: confirmation.payment.method,
      trialZone: confirmation.trialZone,
    },
  });

  if (receiptToken) {
    attachRegistrationReceiptCookie(res, receiptToken, req);
  }

  return res;
}
