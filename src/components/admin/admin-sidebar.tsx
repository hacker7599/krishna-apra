"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/registrations", label: "Registrations" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/banners", label: "Hero banners" },
  { href: "/admin/trials", label: "Trial zones" },
];

export function AdminLogoutButton() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    window.location.href = "/admin/login";
  }
  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
    >
      Log out
    </button>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center gap-2 border-b border-slate-100 p-4">
        <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-slate-200">
          <Image src="/branding/logo.png" alt="" fill className="object-cover" sizes="36px" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Admin</p>
          <p className="text-sm font-bold text-slate-900">League desk</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition md:w-full ${
                active ? "bg-orange-50 text-orange-800" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden p-3 md:block">
        <AdminLogoutButton />
      </div>
      <div className="p-3 md:hidden">
        <AdminLogoutButton />
      </div>
    </aside>
  );
}
