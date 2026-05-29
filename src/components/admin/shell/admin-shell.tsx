"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/shell/admin-sidebar";
import { AdminTopbar } from "@/components/admin/shell/admin-topbar";
import { AdminAlertProvider } from "@/components/admin/ui/admin-alert-provider";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-app">
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
