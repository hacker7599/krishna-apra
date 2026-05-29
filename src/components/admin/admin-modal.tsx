"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "default" | "wide" | "xlarge" | "print";
  /** Use top layer so print modal appears above other open dialogs. */
  layer?: "default" | "top";
};

const sizeClass = {
  default: "max-w-lg",
  wide: "max-w-3xl",
  xlarge: "max-w-5xl",
  print: "max-w-[min(100%,220mm)]",
} as const;

export function AdminModal({ open, title, onClose, children, footer, size = "default", layer = "default" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 ${layer === "top" ? "z-[60]" : "z-50"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <button type="button" className="admin-modal-chrome absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" aria-label="Close dialog" onClick={onClose} />
      <div
        className={`admin-modal-panel relative flex max-h-[min(90vh,90dvh)] w-full ${sizeClass[size]} flex-col overflow-hidden`}
      >
        <div className="admin-modal-panel__header admin-modal-chrome">
          <h2 id="admin-modal-title" className="admin-modal-panel__title">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="admin-btn admin-btn--secondary !min-h-8 !px-2.5"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="admin-modal-panel__body flex-1">{children}</div>
        {footer ? <div className="admin-modal-panel__footer admin-modal-chrome">{footer}</div> : null}
      </div>
    </div>
  );
}
