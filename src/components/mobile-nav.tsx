"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/sponsorship", label: "Partners" },
  { href: "/teams", label: "Teams" },
  { href: "/trials", label: "Trials" },
  { href: "/register", label: "Join" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
      </button>

      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-slate-900/25" aria-label="Close menu" onClick={() => setOpen(false)} />
          <nav
            id="mobile-nav-panel"
            className="fixed inset-x-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-slate-200 bg-white px-4 py-3 shadow-lg"
            aria-label="Mobile"
          >
            <ul className="space-y-1">
              {links.map((l) => {
                const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold ${
                        active ? "bg-orange-50 text-orange-800" : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/register"
              className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-orange-600 text-sm font-bold uppercase tracking-wide text-white"
            >
              Register
            </Link>
          </nav>
        </>
      ) : null}
    </div>
  );
}
