import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listRegistrationsForAdmin } from "@/lib/admin-registrations-query";
import { REGISTRATION_PAYMENT_PAID } from "@/lib/registration-payment-status";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const trialZoneId = searchParams.get("trialZoneId")?.trim() || undefined;
  const q = searchParams.get("q")?.trim() || undefined;
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

  const result = await listRegistrationsForAdmin({
    trialZoneId,
    paymentStatus: REGISTRATION_PAYMENT_PAID,
    q,
    limit,
    offset,
  });

  return NextResponse.json(result);
}
