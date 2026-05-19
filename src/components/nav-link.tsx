"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  exact?: boolean;
};

export function NavLink({ href, children, className, exact }: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-10 items-center whitespace-nowrap rounded-md px-3 text-sm font-semibold transition",
        active ? "bg-orange-50 text-orange-800 ring-1 ring-orange-200/80" : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
        className,
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
