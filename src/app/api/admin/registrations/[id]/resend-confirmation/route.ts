import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logAdminAudit } from "@/lib/admin-audit";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { requireAdminMutation } from "@/lib/require-admin";
import { resendRegistrationConfirmationEmail } from "@/lib/resend-registration-confirmation";
import type { SendRegistrationEmailResult } from "@/lib/send-registration-email";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  const { id } = await ctx.params;
  const registration = await prisma.registration.findUnique({ where: { id } });
  if (!registration) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  let result: SendRegistrationEmailResult;
  try {
    result = await resendRegistrationConfirmationEmail(registration);
  } catch (e) {
    console.error("[resend-confirmation]", e);
    const message = e instanceof Error ? e.message : "Could not resend confirmation email.";
    return NextResponse.json({ ok: false, emailSent: false, error: message }, { status: 500 });
  }

  await logAdminAudit({
    action: "resend_email",
    entityType: "registration",
    entityId: registration.id,
    summary: `Resent confirmation email to ${registration.email} (${result.sent ? "sent" : "failed"})`,
    clientIp: getClientIp(req),
  });

  if (!result.sent) {
    const status = result.throttled ? 429 : 502;
    return NextResponse.json(
      {
        ok: false,
        emailSent: false,
        error: result.error ?? "Email could not be sent.",
        retryAfterSec: result.retryAfterSec,
      },
      { status },
    );
  }

  return NextResponse.json({ ok: true, emailSent: true });
}
