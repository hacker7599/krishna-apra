import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [registrations, teams, banners, trialZones, publishedTeams, publishedBanners, publishedTrialZones] =
    await Promise.all([
      prisma.registration.count(),
      prisma.team.count(),
      prisma.heroBanner.count(),
      prisma.trialZone.count(),
      prisma.team.count({ where: { published: true } }),
      prisma.heroBanner.count({ where: { published: true } }),
      prisma.trialZone.count({ where: { published: true } }),
    ]);

  return NextResponse.json({
    registrations,
    teams,
    banners,
    trialZones,
    publishedTeams,
    publishedBanners,
    publishedTrialZones,
  });
}
