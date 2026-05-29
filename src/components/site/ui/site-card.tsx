import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CARD, CARD_PAD } from "@/lib/site-ui";

export function SiteCard({
  children,
  padded = true,
  hover = true,
  className,
}: {
  children: ReactNode;
  padded?: boolean;
  hover?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(padded ? CARD_PAD : CARD, hover && "site-card--hover", className)}>
      {children}
    </div>
  );
}
