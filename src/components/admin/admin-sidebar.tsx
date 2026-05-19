"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KRISHNA_APRA_LOGO_SRC, LEAGUE_LOGO_SRC } from "@/lib/branding";

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
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#1B365D]"
    >
      Sign out
    </button>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white shadow-sm md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <div className="border-b border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-0.5">
            <Image src={LEAGUE_LOGO_SRC} alt="" fill className="object-contain" sizes="40px" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Future Star U-15</p>
            <p className="truncate text-sm font-semibold text-[#1B365D]">League desk</p>
          </div>
        </div>
        <div className="mt-3 px-1">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Title sponsor</p>
          <Image
            src={KRISHNA_APRA_LOGO_SRC}
            alt="Krishna Apra"
            width={140}
            height={56}
            unoptimized
            className="h-9 w-auto object-contain object-left"
          />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible md:p-3">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition md:w-full ${
                active
                  ? "bg-[#1B365D] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#1B365D]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden border-t border-slate-100 p-3 md:block">
        <AdminLogoutButton />
      </div>
      <div className="border-t border-slate-100 p-3 md:hidden">
        <AdminLogoutButton />
      </div>
    </aside>
  );
}
