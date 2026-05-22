import { AdminSessionProvider } from "@/components/admin/admin-session-provider";
import { AdminShellHeader } from "@/components/admin/admin-shell-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <div className="admin-app flex min-h-screen flex-col bg-slate-50 md:flex-row">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminShellHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminSessionProvider>
  );
}
