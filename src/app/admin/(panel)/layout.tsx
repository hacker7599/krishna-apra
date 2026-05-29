import { AdminSessionProvider } from "@/components/admin/admin-session-provider";
import { AdminShell } from "@/components/admin/shell/admin-shell";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}
