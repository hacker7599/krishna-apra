"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/shell/admin-sidebar";
import { AdminTopbar } from "@/components/admin/shell/admin-topbar";
import { AdminAlertProvider } from "@/components/admin/ui/admin-alert-provider";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className={`admin-app${sidebarOpen ? " admin-sidebar-open" : ""}`}>
      <AdminAlertProvider>
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-main">
          <AdminTopbar onMenuOpen={() => setSidebarOpen(true)} />
          <div className="admin-main__content">
            <div className="admin-module">{children}</div>
          </div>
        </div>
      </AdminAlertProvider>
    </div>
  );
}
