import type { ReactNode } from "react";

export function OfflinePrintCheckbox({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span className={`offline-print-check ${className}`.trim()}>
      <span className="offline-print-check__box" aria-hidden />
      <span className="offline-print-check__label">{label}</span>
    </span>
  );
}

export function OfflineFormSection({
  number,
  title,
  hint,
  children,
  boxed,
  className = "",
}: {
  number?: string;
  title: string;
  hint?: string;
  children: ReactNode;
  boxed?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`offline-form-section${boxed ? " offline-form-section--boxed" : ""} ${className}`.trim()}
    >
      <header className="offline-form-section__head">
        {number ? <span className="offline-form-section__num">{number}.</span> : null}
        <h2 className="offline-form-section__title">{title}</h2>
      </header>
      {hint ? <p className="offline-form-section__hint">{hint}</p> : null}
      <div className="offline-form-section__body">{children}</div>
    </section>
  );
}

export function OfflineFieldLine({ label, sublabel, span = 1 }: { label: string; sublabel?: string; span?: 1 | 2 }) {
  return (
    <div className={`offline-field-line${span === 2 ? " offline-field-line--wide" : ""}`}>
      <span className="offline-field-line__label">{label}</span>
      {sublabel ? <span className="offline-field-line__sublabel">{sublabel}</span> : null}
      <div className="offline-field-line__write" />
    </div>
  );
}
