import type { Metadata } from "next";
import { AdminRegistrationsPanel } from "@/components/admin/admin-registrations-panel";

export const metadata: Metadata = {
  title: "Registrations · Admin",
  robots: { index: false, follow: false },
};

export default function AdminRegistrationsPage() {
  return <AdminRegistrationsPanel />;
}
