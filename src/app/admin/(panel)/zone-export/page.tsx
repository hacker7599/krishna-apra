import type { Metadata } from "next";
import { AdminZoneExportPanel } from "@/components/admin/admin-zone-export-panel";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Zone export · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminZoneExportPage() {
  const trialZones = await prisma.trialZone.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, trialPlace: true, zone: true },
  });

  return <AdminZoneExportPanel trialZones={trialZones} />;
}
