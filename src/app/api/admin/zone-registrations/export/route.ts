import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listRegistrationsForAdminExport } from "@/lib/admin-registrations-query";
import { zoneRegistrationsToExcelCsv } from "@/lib/admin-zone-export-csv";
import { prisma } from "@/lib/prisma";
import { REGISTRATION_PAYMENT_PAID } from "@/lib/registration-payment-status";
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

  const { rows, truncated } = await listRegistrationsForAdminExport({
    trialZoneId,
    paymentStatus: REGISTRATION_PAYMENT_PAID,
    q,
  });

  let zoneLabel = "all-zones";
  if (trialZoneId) {
    const zone = await prisma.trialZone.findUnique({
      where: { id: trialZoneId },
      select: { trialPlace: true, zone: true },
    });
    if (zone) {
      zoneLabel = `${zone.trialPlace}-${zone.zone}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48);
    }
  }

  const csv = zoneRegistrationsToExcelCsv(rows);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `players-${zoneLabel}-${date}${truncated ? "-truncated" : ""}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...(truncated ? { "X-Export-Truncated": "true" } : {}),
    },
  });
}
