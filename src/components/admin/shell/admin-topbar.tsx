"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminSession } from "@/components/admin/admin-session-provider";
import { findAdminNavItem, getAdminPageMeta } from "@/lib/admin-navigation";

type Props = {
  onMenuOpen: () => void;
};

export function AdminTopbar({ onMenuOpen }: Props) {
  const pathname = usePathname();
  const { session, ready } = useAdminSession();
  const meta = getAdminPageMeta(pathname);
  const navItem = findAdminNavItem(pathname);

  return (
    <header className="admin-topbar admin-layout-chrome">
      <div className="admin-topbar__start">
        <button type="button" className="admin-topbar__menu" onClick={onMenuOpen} aria-label="Open navigation">
          <span className="admin-topbar__menu-bar" />
          <span className="admin-topbar__menu-bar" />
          <span className="admin-topbar__menu-bar" />
        </button>
        <div className="admin-topbar__titles min-w-0">
          <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/admin" className="admin-breadcrumbs__link">
              Admin
            </Link>
            {pathname !== "/admin" ? (
              <>
                <span className="admin-breadcrumbs__sep" aria-hidden>
                  /
                </span>
                <span className="admin-breadcrumbs__current">{navItem?.label ?? meta.title}</span>
              </>
            ) : null}
          </nav>
          <h1 className="admin-topbar__title">{meta.title}</h1>
          <p className="admin-topbar__subtitle">{meta.subtitle}</p>
        </div>
      </div>

      <div className="admin-topbar__end">
        <span className="admin-topbar__module-pill">{meta.module}</span>
        <div className="admin-topbar__user">
          <div className="hidden text-right sm:block">
            <p className="admin-topbar__username">{ready && session ? session.username : "…"}</p>
            <p className="admin-topbar__role">Administrator</p>
          </div>
          <span className="admin-topbar__avatar" aria-hidden>
            {(session?.username ?? "A").slice(0, 1).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
