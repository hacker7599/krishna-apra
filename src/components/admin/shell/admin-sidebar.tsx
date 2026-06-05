"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminNavIconView } from "@/components/admin/icons/admin-nav-icons";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { ADMIN_NAV_MODULES, isAdminNavActive } from "@/lib/admin-navigation";
import { KRISHNA_APRA_LOGO_SRC, LEAGUE_LOGO_SRC } from "@/lib/branding";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  async function logout() {
    sessionStorage.removeItem("fs_admin_csrf");
    sessionStorage.removeItem("fs_admin_user");
    await adminFetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <>
      <button
        type="button"
        className={cn("admin-sidebar-backdrop", open && "is-open")}
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className={cn("admin-sidebar", open && "is-open")} aria-label="Admin navigation">
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__brand-row">
            <div className="admin-sidebar__logo">
              <Image src={LEAGUE_LOGO_SRC} alt="" fill className="object-contain p-1" sizes="40px" />
            </div>
            <div className="min-w-0">
              <p className="admin-sidebar__eyebrow">Future Star U-15</p>
              <p className="admin-sidebar__title">League desk</p>
            </div>
          </div>
          <div className="admin-sidebar__sponsor">
            <p className="admin-sidebar__sponsor-label">Title sponsor</p>
            <Image
              src={KRISHNA_APRA_LOGO_SRC}
              alt="Krishna Apra"
              width={128}
              height={40}
              unoptimized
              className="h-7 w-auto object-contain object-left"
            />
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {ADMIN_NAV_MODULES.map((module) => (
            <div key={module.id} className="admin-sidebar__module">
              <p className="admin-sidebar__module-label">{module.label}</p>
              <ul className="admin-sidebar__list">
                {module.items.map((item) => {
                  const active = isAdminNavActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        prefetch={true}
                        onClick={onClose}
                        className={cn("admin-sidebar__link", active && "is-active")}
                        title={item.description}
                      >
                        <AdminNavIconView name={item.icon} />
                        <span className="admin-sidebar__link-text">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-sidebar__footer-link" onClick={onClose}>
            View public site
            <span aria-hidden>↗</span>
          </Link>
          <button type="button" onClick={() => void logout()} className="admin-sidebar__logout">
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
