import Link from "next/link";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-1px)] flex-col bg-slate-50 md:flex-row">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <Link href="/" className="text-sm font-semibold text-orange-700 hover:text-orange-800">
            ← View website
          </Link>
        </div>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
