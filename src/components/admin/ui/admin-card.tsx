import type { ReactNode } from "react";

export function AdminCard({
  title,
  children,
  actions,
  className = "",
  bodyClassName = "",
}: {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`admin-card ${className}`.trim()}>
      {title || actions ? (
        <div className="admin-card__header flex flex-wrap items-center justify-between gap-3">
          {title ? <h3 className="admin-card__title">{title}</h3> : <div />}
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={`admin-card__body ${bodyClassName}`.trim()}>{children}</div>
    </div>
  );
}
