"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  exact?: boolean;
  highlight?: boolean;
};

export function NavLink({ href, children, className, exact, highlight }: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "site-nav-link",
        active && "is-active",
        highlight && "site-nav-link--highlight",
        className,
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
