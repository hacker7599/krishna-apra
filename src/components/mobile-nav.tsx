"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE_PRIMARY_NAV } from "@/lib/site-navigation";
import { BTN_PRIMARY } from "@/lib/site-ui";

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 shadow-sm"
        aria-expanded={open}
        aria-controls="site-mobile-drawer"
        aria-label="Open menu"
      >
        <span className="block h-0.5 w-5 rounded-full bg-slate-800" />
        <span className="block h-0.5 w-5 rounded-full bg-slate-800" />
        <span className="block h-0.5 w-5 rounded-full bg-slate-800" />
      </button>

      {open ? (
        <>
          <button type="button" className="site-drawer-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />
          <nav id="site-mobile-drawer" className="site-drawer" aria-label="Mobile navigation">
            <div className="site-drawer__head">
              <p className="site-drawer__title">Menu</p>
              <button type="button" className="site-drawer__close" onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <ul className="site-drawer__nav list-none space-y-1 p-0 m-0">
              {SITE_PRIMARY_NAV.map((item) => {
                const active = isActive(pathname, item.href, item.exact);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`site-drawer__link${active ? " is-active" : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="site-drawer__footer">
              <Link href="/register" onClick={() => setOpen(false)} className={`${BTN_PRIMARY} w-full`}>
                Register for trials
              </Link>
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
