"use client";

import { REGISTRATION_FORM_STEPS } from "@/lib/register-form-steps";

type Props = {
  variant?: "sidebar" | "bar";
  className?: string;
};

export function RegisterFormOutline({ variant = "sidebar", className = "" }: Props) {
  const isBar = variant === "bar";

  return (
    <nav
      className={`register-form-outline register-form-outline--${variant} ${className}`.trim()}
      aria-label="Form sections"
    >
      <p className="register-form-outline__heading">{isBar ? "Sections" : "Jump to section"}</p>
      <ol className="register-form-outline__list">
        {REGISTRATION_FORM_STEPS.map((step) => (
          <li key={step.id}>
            <a href={`#${step.id}`} className="register-form-outline__link">
              <span className="register-form-outline__num" aria-hidden>
                {step.number}
              </span>
              <span className="register-form-outline__label">{isBar ? step.short : step.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
