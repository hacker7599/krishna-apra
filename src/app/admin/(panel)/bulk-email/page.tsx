import type { Metadata } from "next";
import { AdminBulkEmailPanel } from "@/components/admin/admin-bulk-email-panel";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Bulk email · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBulkEmailPage() {
  const trialZones = await prisma.trialZone.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, trialPlace: true, zone: true },
  });

  return <AdminBulkEmailPanel trialZones={trialZones} />;
}
