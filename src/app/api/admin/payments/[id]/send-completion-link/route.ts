import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logAdminAudit } from "@/lib/admin-audit";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { requireAdminMutation } from "@/lib/require-admin";
import { createCompletionInviteForPaymentOrder } from "@/lib/registration-completion-invite";
import { sendRegistrationCompletionInviteEmail } from "@/lib/send-registration-completion-email";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const order = await prisma.paymentOrder.findUnique({
    where: { id },
    select: { playerName: true },
  });

  const created = await createCompletionInviteForPaymentOrder(id);
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: created.status });
  }

  const playerName = order?.playerName?.trim() || "Player";
  const emailResult = await sendRegistrationCompletionInviteEmail({
    email: created.email,
    playerName,
    completionUrl: created.completionUrl,
    registrationId: created.registrationId,
    paymentOrderId: id,
  });

  await logAdminAudit({
    action: "send_completion_link",
    entityType: "payment_order",
    entityId: id,
    summary: `Sent registration completion link to ${created.email}`,
    metadata: { emailSent: emailResult.sent, expiresAt: created.expiresAt.toISOString() },
    clientIp: getClientIp(req),
  });

  return NextResponse.json({
    ok: true,
    completionUrl: created.completionUrl,
    expiresAt: created.expiresAt.toISOString(),
    email: created.email,
    emailSent: emailResult.sent,
    emailError: emailResult.sent ? undefined : emailResult.error,
  });
}
