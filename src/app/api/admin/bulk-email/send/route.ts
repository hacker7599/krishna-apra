import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendBulkTrialZoneEmails, validateBulkEmailInput } from "@/lib/admin-bulk-email";
import { getClientIp } from "@/lib/get-client-ip";
import { requireAdminMutation } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  let body: { trialZoneId?: string; subject?: string; body?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateBulkEmailInput(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const result = await sendBulkTrialZoneEmails({
    trialZoneId: validated.trialZoneId,
    subject: validated.subject,
    body: validated.body,
    clientIp: getClientIp(req),
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
