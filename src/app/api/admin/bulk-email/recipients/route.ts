import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { countBulkEmailRecipients, listBulkEmailRecipients } from "@/lib/admin-bulk-email";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trialZoneId = new URL(req.url).searchParams.get("trialZoneId")?.trim() ?? "";
  if (!trialZoneId) {
    return NextResponse.json({ error: "trialZoneId is required." }, { status: 400 });
  }

  const zone = await prisma.trialZone.findUnique({
    where: { id: trialZoneId },
    select: {
      id: true,
      trialPlace: true,
      zone: true,
      address: true,
      navigationUrl: true,
      contactDetails: true,
    },
  });

  if (!zone) {
    return NextResponse.json({ error: "Trial zone not found." }, { status: 404 });
  }

  const [total, sample] = await Promise.all([
    countBulkEmailRecipients(trialZoneId),
    listBulkEmailRecipients(trialZoneId).then((rows) =>
      rows.slice(0, 8).map((r) => ({
        playerName: r.playerName,
        email: r.email,
        registrationCode: r.registrationCode,
      })),
    ),
  ]);

  return NextResponse.json({ zone, total, sample });
}
