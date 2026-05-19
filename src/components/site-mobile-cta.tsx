"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_ON = ["/register", "/register/offline"];

export function SiteMobileCta() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith("/admin"))) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md sm:hidden print:hidden"
      role="region"
      aria-label="Quick actions"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <Link
          href="/trials"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-bold uppercase tracking-wide text-slate-900"
        >
          Trial zones
        </Link>
        <Link
          href="/register"
          className="inline-flex min-h-11 flex-[1.2] items-center justify-center rounded-lg bg-orange-600 text-sm font-bold uppercase tracking-wide text-white shadow-sm"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
