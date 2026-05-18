import type { Metadata } from "next";
import { AdminTrialZonesManager } from "@/components/admin/admin-trial-zones-manager";

export const metadata: Metadata = {
  title: "Trial zones · Admin",
  robots: { index: false, follow: false },
};

export default function AdminTrialZonesPage() {
  return <AdminTrialZonesManager />;
}
