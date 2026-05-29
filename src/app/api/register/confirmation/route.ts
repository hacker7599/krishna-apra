import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRegistrationReceiptToken } from "@/lib/registration-receipt-cookie";
import { verifyRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { ensureRegistrationCode, assignPaymentCodeOnPaid } from "@/lib/registration-codes";
import { toRegistrationConfirmation } from "@/lib/registration-confirmation";
import { isEnrolledPaymentStatus } from "@/lib/registration-payment-status";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = getRegistrationReceiptToken(req);
  if (!token) {
    return NextResponse.json({ error: "Confirmation access expired or missing. Use registration status or your email link." }, { status: 401 });
  }

  const registrationId = await verifyRegistrationConfirmationToken(token);
  if (!registrationId) {
    return NextResponse.json({ error: "This confirmation link has expired or is invalid." }, { status: 401 });
  }

  const row = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { trialZone: { select: { trialPlace: true, zone: true } } },
  });
  if (!row) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  if (!row.registrationCode) {
    await ensureRegistrationCode(row.id);
  }
  if (isEnrolledPaymentStatus(row.paymentStatus) && !row.paymentCode) {
    await assignPaymentCodeOnPaid(row.id);
  }

  const fresh = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { trialZone: { select: { trialPlace: true, zone: true } } },
  });
  if (!fresh) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  return NextResponse.json(toRegistrationConfirmation(fresh));
}
