import type { Metadata } from "next";
import { AdminRegistrationsPanel } from "@/components/admin/admin-registrations-panel";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Registrations · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminRegistrationsPage() {
  const trialZones = await prisma.trialZone.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, trialPlace: true, zone: true },
  });

  return <AdminRegistrationsPanel trialZones={trialZones} />;
}
