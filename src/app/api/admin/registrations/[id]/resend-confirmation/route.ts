import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logAdminAudit } from "@/lib/admin-audit";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { requireAdminMutation } from "@/lib/require-admin";
import { resendRegistrationConfirmationEmail } from "@/lib/resend-registration-confirmation";

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

  const result = await resendRegistrationConfirmationEmail(registration);

  await logAdminAudit({
    action: "resend_email",
    entityType: "registration",
    entityId: registration.id,
    summary: `Resent confirmation email to ${registration.email} (${result.sent ? "sent" : "failed"})`,
    clientIp: getClientIp(req),
  });

  if (!result.sent) {
    return NextResponse.json(
      { ok: false, emailSent: false, error: result.error ?? "Email could not be sent." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, emailSent: true });
}
