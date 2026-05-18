import type { Metadata } from "next";
import { AdminDashboardHome } from "@/components/admin/admin-dashboard-home";

export const metadata: Metadata = {
  title: "Dashboard · Admin",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <AdminDashboardHome />;
}
