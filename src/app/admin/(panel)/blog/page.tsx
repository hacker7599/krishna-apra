import type { Metadata } from "next";
import { AdminBlogManager } from "@/components/admin/admin-blog-manager";

export const metadata: Metadata = {
  title: "Blog",
  robots: { index: false, follow: false },
};

export default function AdminBlogPage() {
  return <AdminBlogManager />;
}
