import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logAdminAudit } from "@/lib/admin-audit";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { isPendingPaymentStatus } from "@/lib/registration-payment-status";
import { requireAdminMutation } from "@/lib/require-admin";
import { createPaymentInviteForRegistration } from "@/lib/registration-payment-invite";
import { sendRegistrationPaymentReminderEmail } from "@/lib/send-registration-payment-reminder-email";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const registration = await prisma.registration.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      playerName: true,
      paymentStatus: true,
      registrationCode: true,
      trialZone: { select: { trialPlace: true, zone: true } },
    },
  });

  if (!registration) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  if (!isPendingPaymentStatus(registration.paymentStatus)) {
    return NextResponse.json(
      { error: "Payment link can only be sent for registrations with pending payment." },
      { status: 400 },
    );
  }

  const email = registration.email.trim();
  if (!email) {
    return NextResponse.json({ error: "This registration has no email address." }, { status: 400 });
  }

  let invite: Awaited<ReturnType<typeof createPaymentInviteForRegistration>>;
  try {
    invite = await createPaymentInviteForRegistration(registration.id);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("registrationPaymentInvite") || msg.includes("does not exist")) {
      return NextResponse.json(
        {
          error:
            "Payment link table is missing. On the server run: npm run db:add-payment-invite-table (or npm run db:push), then restart the app.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Could not create the payment link. Try again." }, { status: 500 });
  }
  if (!invite.ok) {
    return NextResponse.json({ error: invite.error }, { status: invite.status });
  }

  const playerName = registration.playerName.trim() || "Player";
  const emailResult = await sendRegistrationPaymentReminderEmail({
    email,
    playerName,
    registrationId: registration.id,
    paymentLink: invite.paymentUrl,
    registrationCode: registration.registrationCode,
    trialPlace: registration.trialZone?.trialPlace ?? null,
    trialZone: registration.trialZone?.zone ?? null,
    skipUserEmailThrottle: true,
  });

  await logAdminAudit({
    action: "send_payment_link",
    entityType: "registration",
    entityId: id,
    summary: `Sent payment link to ${email}`,
    metadata: {
      emailSent: emailResult.sent,
      paymentUrl: invite.paymentUrl,
      expiresAt: invite.expiresAt.toISOString(),
    },
    clientIp: getClientIp(req),
  });

  return NextResponse.json({
    ok: true,
    paymentUrl: invite.paymentUrl,
    expiresAt: invite.expiresAt.toISOString(),
    email,
    emailSent: emailResult.sent,
    emailError: emailResult.sent ? undefined : emailResult.error,
  });
}
