"use client";

import { usePathname } from "next/navigation";
import { useAdminSession } from "@/components/admin/admin-session-provider";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Command center", subtitle: "Trial registrations, payments, and league content" },
  "/admin/registrations": { title: "Registrations", subtitle: "Player sign-ups, proofs, and receipts" },
  "/admin/payments": { title: "Payments", subtitle: "Razorpay orders, revenue, and audit trail" },
  "/admin/activity": { title: "Activity log", subtitle: "Admin actions on league data" },
  "/admin/teams": { title: "Teams", subtitle: "Franchise listings on the public site" },
  "/admin/banners": { title: "Hero banners", subtitle: "Homepage carousel and CTAs" },
  "/admin/trials": { title: "Trial zones", subtitle: "Venues and contact details for /trials" },
  "/admin/blog": { title: "Blog", subtitle: "Articles, SEO meta tags, and /blog publishing" },
};

export function AdminShellHeader() {
  const pathname = usePathname();
  const { session, ready } = useAdminSession();

  const match =
    Object.entries(titles).find(([path]) => path !== "/admin" && pathname.startsWith(path))?.[1] ??
    titles["/admin"];

  return (
    <header className="admin-layout-chrome sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">Future Star U-15 · Operations</p>
          <h2 className="truncate font-[family-name:var(--font-barlow)] text-lg font-bold text-[#1B365D] sm:text-xl">{match.title}</h2>
          <p className="hidden truncate text-xs text-slate-500 sm:block">{match.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-slate-800">{ready && session ? session.username : "…"}</p>
            <p className="text-[10px] text-slate-500">League desk</p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1B365D] text-xs font-bold text-white">
            {(session?.username ?? "A").slice(0, 1).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
