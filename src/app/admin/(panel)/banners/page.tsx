import type { Metadata } from "next";
import { AdminBannersManager } from "@/components/admin/admin-banners-manager";

export const metadata: Metadata = {
  title: "Hero banners · Admin",
  robots: { index: false, follow: false },
};

export default function AdminBannersPage() {
  return <AdminBannersManager />;
}
