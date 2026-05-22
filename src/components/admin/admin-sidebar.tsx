"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { KRISHNA_APRA_LOGO_SRC, LEAGUE_LOGO_SRC } from "@/lib/branding";

const sections = [
  {
    label: "Operations",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/registrations", label: "Registrations" },
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/activity", label: "Activity log" },
      { href: "/admin/emails", label: "Email log" },
    ],
  },
  {
    label: "Site content",
    items: [
      { href: "/admin/teams", label: "Teams" },
      { href: "/admin/banners", label: "Hero banners" },
      { href: "/admin/trials", label: "Trial zones" },
    ],
  },
];

export function AdminLogoutButton() {
  async function logout() {
    sessionStorage.removeItem("fs_admin_csrf");
    sessionStorage.removeItem("fs_admin_user");
    await adminFetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }
  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-[#1B365D]"
    >
      Sign out
    </button>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-layout-chrome flex w-full flex-col border-b border-slate-200 bg-white shadow-sm md:w-56 md:shrink-0 md:border-b-0 md:border-r lg:w-60">
      <div className="border-b border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-0.5">
            <Image src={LEAGUE_LOGO_SRC} alt="" fill className="object-contain" sizes="40px" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-orange-600">Future Star U-15</p>
            <p className="truncate text-sm font-semibold text-[#1B365D]">League desk</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
          <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-slate-400">Title sponsor</p>
          <Image
            src={KRISHNA_APRA_LOGO_SRC}
            alt="Krishna Apra"
            width={120}
            height={48}
            unoptimized
            className="h-8 w-auto object-contain object-left"
          />
        </div>
      </div>

      <nav className="flex-1 p-3">
        {sections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">{section.label}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={true}
                      className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-[#1B365D] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#1B365D]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <Link
          href="/"
          target="_blank"
          className="mb-2 block rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-[#1B365D]"
        >
          View public site ↗
        </Link>
        <AdminLogoutButton />
      </div>
    </aside>
  );
}
