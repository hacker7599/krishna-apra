import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { registrationsToCsv } from "@/lib/admin-registrations-csv";
import { listRegistrationsForAdminExport } from "@/lib/admin-registrations-query";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || undefined;
  const from = searchParams.get("from")?.trim() || undefined;
  const to = searchParams.get("to")?.trim() || undefined;
  const paymentStatus = searchParams.get("paymentStatus")?.trim() || undefined;
  const trialZoneId = searchParams.get("trialZoneId")?.trim() || undefined;

  const { rows, truncated } = await listRegistrationsForAdminExport({
    q,
    from,
    to,
    paymentStatus,
    trialZoneId,
  });

  const csv = registrationsToCsv(rows);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `registrations-${date}${truncated ? "-truncated" : ""}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...(truncated ? { "X-Export-Truncated": "true" } : {}),
    },
  });
}
