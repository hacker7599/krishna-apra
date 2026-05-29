import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger";

const variantClass: Record<Variant, string> = {
  primary: "admin-btn admin-btn--primary",
  secondary: "admin-btn admin-btn--secondary",
  danger: "admin-btn admin-btn--danger",
};

export function AdminButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button type="button" className={`${variantClass[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
