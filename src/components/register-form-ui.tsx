import type { ReactNode } from "react";

export function RegisterFormSection({
  number,
  title,
  description,
  children,
  className = "",
}: {
  number?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`register-form-section ${className}`.trim()}>
      <div className="register-form-section__head">
        {number ? (
          <span className="register-form-section__num" aria-hidden>
            {number}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="register-form-section__title">{title}</h2>
          {description ? <p className="register-form-section__desc">{description}</p> : null}
        </div>
      </div>
      <div className="register-form-section__body">{children}</div>
    </section>
  );
}

export function RegisterFormField({
  label,
  htmlFor,
  hint,
  error,
  optional,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`register-form-field ${className}`.trim()}>
      <label htmlFor={htmlFor} className="register-form-field__label">
        {label}
        {optional ? <span className="register-form-field__optional">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p className="register-form-field__error" role="alert">
          {error}
        </p>
      ) : null}
      {hint && !error ? <p className="register-form-field__hint">{hint}</p> : null}
    </div>
  );
}

export function registerInputClass(hasError: boolean) {
  return `register-form-input${hasError ? " register-form-input--error" : ""}`;
}
