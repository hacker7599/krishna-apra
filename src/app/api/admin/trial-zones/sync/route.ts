import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logAdminAudit } from "@/lib/admin-audit";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { requireAdminMutation } from "@/lib/require-admin";
import { revalidatePublicTrialZonePages } from "@/lib/revalidate-public-trial-zones";
import { syncOfficialTrialZones } from "@/lib/sync-official-trial-zones";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  const result = await syncOfficialTrialZones(prisma);
  revalidatePublicTrialZonePages();

  await logAdminAudit({
    action: "sync",
    entityType: "trial_zone",
    entityId: "catalog",
    summary: `Resynced official trial zones (${result.officialCount} venues)`,
    clientIp: getClientIp(req),
  });

  return NextResponse.json({ ok: true, ...result });
}
