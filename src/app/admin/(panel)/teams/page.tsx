import type { Metadata } from "next";
import { AdminTeamsManager } from "@/components/admin/admin-teams-manager";

export const metadata: Metadata = {
  title: "Teams · Admin",
  robots: { index: false, follow: false },
};

export default function AdminTeamsPage() {
  return <AdminTeamsManager />;
}
