import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminMutation } from "@/lib/require-admin";
import { trialZonePatchSchema } from "@/lib/admin-entity-schemas";
import { revalidatePublicTrialZonePages } from "@/lib/revalidate-public-trial-zones";
import { renumberTrialZoneSortOrders } from "@/lib/trial-zone-sort";
import {
  attachTrialZoneRegistrationOpen,
  getTrialZoneRegistrationMode,
  setTrialZoneRegistrationOpen,
} from "@/lib/trial-zone-registration-open";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = trialZonePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const raw = parsed.data;
  if (Object.keys(raw).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const data: Prisma.TrialZoneUpdateInput = {};
  if (raw.trialPlace !== undefined) data.trialPlace = raw.trialPlace.trim();
  if (raw.zone !== undefined) data.zone = raw.zone.trim();
  if (raw.address !== undefined) data.address = raw.address.trim();
  if (raw.contactDetails !== undefined) data.contactDetails = raw.contactDetails;
  if (raw.navigationUrl !== undefined) data.navigationUrl = raw.navigationUrl;
  if (raw.sortOrder !== undefined) data.sortOrder = raw.sortOrder;
  if (raw.published !== undefined) data.published = raw.published;

  const registrationOpen = raw.registrationOpen;

  try {
    const exists = await prisma.trialZone.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (Object.keys(data).length > 0) {
      await prisma.trialZone.update({ where: { id }, data });
    }

    if (registrationOpen !== undefined) {
      const mode = await getTrialZoneRegistrationMode();
      if (mode === "legacy") {
        return NextResponse.json(
          {
            error:
              "Registration toggle is not available yet. Run: npm run db:add-trial-zone-registration-open && npm run db:generate",
          },
          { status: 503 },
        );
      }
      await setTrialZoneRegistrationOpen(id, registrationOpen);
    }

    await renumberTrialZoneSortOrders(prisma);
    revalidatePublicTrialZonePages();
    const row = await prisma.trialZone.findUniqueOrThrow({ where: { id } });
    const [enriched] = await attachTrialZoneRegistrationOpen([row]);
    return NextResponse.json(enriched);
  } catch (error) {
    console.error("[trial-zones] PATCH failed:", error);
    return NextResponse.json({ error: "Could not update trial zone." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  const { id } = await ctx.params;

  try {
    await prisma.trialZone.delete({ where: { id } });
    await renumberTrialZoneSortOrders(prisma);
    revalidatePublicTrialZonePages();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
