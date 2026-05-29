"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/lib/site-ui";

const HIDDEN_ON = ["/register", "/register/offline"];

export function SiteMobileCta() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith("/admin"))) {
    return null;
  }

  return (
    <div className="site-mobile-cta print:hidden" role="region" aria-label="Quick actions">
      <div className="site-mobile-cta__inner">
        <Link href="/trials" className={`${BTN_SECONDARY} flex-1 !min-h-11`}>
          Trial zones
        </Link>
        <Link href="/register" className={`${BTN_PRIMARY} flex-[1.15] !min-h-11`}>
          Register
        </Link>
      </div>
    </div>
  );
}
