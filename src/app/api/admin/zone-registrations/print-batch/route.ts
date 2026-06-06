import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listPaidZoneRegistrationIdsForPrint } from "@/lib/admin-zone-print-batch";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const trialZoneId = searchParams.get("trialZoneId")?.trim() || undefined;
  const q = searchParams.get("q")?.trim() || undefined;

  const result = await listPaidZoneRegistrationIdsForPrint({ trialZoneId, q });
  return NextResponse.json({
    ids: result.ids,
    total: result.total,
    printCount: result.ids.length,
    truncated: result.truncated,
  });
}
