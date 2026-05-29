import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BTN_PRIMARY, BTN_PRIMARY_SM, BTN_SECONDARY, BTN_SECONDARY_SM } from "@/lib/site-ui";

type Variant = "primary" | "secondary";
type Size = "default" | "sm";

const variantClass: Record<Variant, string> = {
  primary: BTN_PRIMARY,
  secondary: BTN_SECONDARY,
};

const smVariantClass: Record<Variant, string> = {
  primary: BTN_PRIMARY_SM,
  secondary: BTN_SECONDARY_SM,
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

type LinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

function classes(variant: Variant, size: Size, className?: string) {
  return cn(size === "sm" ? smVariantClass[variant] : variantClass[variant], className);
}

export function SiteButton({ variant = "primary", size = "default", className, children, ...props }: ButtonProps) {
  return (
    <button type="button" className={classes(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function SiteButtonLink({ variant = "primary", size = "default", className, children, ...props }: LinkProps) {
  return (
    <Link className={classes(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
