"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "default" | "wide" | "print";
};

const sizeClass = {
  default: "max-w-lg",
  wide: "max-w-3xl",
  print: "max-w-[min(100%,220mm)]",
} as const;

export function AdminModal({ open, title, onClose, children, footer, size = "default" }: Props) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      <button type="button" className="admin-modal-chrome absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" aria-label="Close dialog" onClick={onClose} />
      <div
        className={`relative flex max-h-[min(90vh,90dvh)] w-full ${sizeClass[size]} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
      >
        <div className="admin-modal-chrome flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="admin-modal-title" className="text-lg font-semibold text-[#1B365D]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="admin-modal-chrome flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
