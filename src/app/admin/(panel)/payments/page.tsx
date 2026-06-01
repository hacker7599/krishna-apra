import { AdminPaymentsPanel } from "@/components/admin/admin-payments-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const trialZones = await prisma.trialZone.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, trialPlace: true, zone: true },
  });

  return <AdminPaymentsPanel trialZones={trialZones} />;
}
