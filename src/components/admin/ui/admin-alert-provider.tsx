"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type AdminAlertVariant = "success" | "error" | "info";

export type AdminAlertOptions = {
  title?: string;
  message: string;
  variant?: AdminAlertVariant;
};

type AlertState = AdminAlertOptions & { open: true };

type AdminAlertContextValue = {
  showAlert: (options: AdminAlertOptions) => Promise<void>;
};

const AdminAlertContext = createContext<AdminAlertContextValue | null>(null);

const DEFAULT_TITLES: Record<AdminAlertVariant, string> = {
  success: "Done",
  error: "Something went wrong",
  info: "Notice",
};

function AlertIcon({ variant }: { variant: AdminAlertVariant }) {
  if (variant === "success") {
    return (
      <span className="admin-alert-dialog__icon admin-alert-dialog__icon--success" aria-hidden>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
        </svg>
      </span>
    );
  }
  if (variant === "error") {
    return (
      <span className="admin-alert-dialog__icon admin-alert-dialog__icon--error" aria-hidden>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" d="M12 8v5M12 16h.01" />
        </svg>
      </span>
    );
  }
  return (
    <span className="admin-alert-dialog__icon admin-alert-dialog__icon--info" aria-hidden>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 16v-4M12 8h.01" />
      </svg>
    </span>
  );
}

function AdminAlertDialog({
  state,
  onClose,
}: {
  state: AlertState;
  onClose: () => void;
}) {
  const variant = state.variant ?? "info";
  const title = state.title ?? DEFAULT_TITLES[variant];
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="admin-alert-dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="admin-alert-title"
      aria-describedby="admin-alert-message"
    >
      <button type="button" className="admin-alert-dialog__backdrop" aria-label="Close" onClick={onClose} />
      <div className={`admin-alert-dialog__panel admin-alert-dialog__panel--${variant}`}>
        <div className="admin-alert-dialog__accent" aria-hidden />
        <div className="admin-alert-dialog__content">
          <AlertIcon variant={variant} />
          <h2 id="admin-alert-title" className="admin-alert-dialog__title">
            {title}
          </h2>
          <p id="admin-alert-message" className="admin-alert-dialog__message">
            {state.message}
          </p>
        </div>
        <div className="admin-alert-dialog__actions">
          <button ref={okRef} type="button" className="admin-btn admin-btn--primary admin-alert-dialog__ok" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminAlertProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AlertState | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  const close = useCallback(() => {
    setState(null);
    resolveRef.current?.();
    resolveRef.current = null;
  }, []);

  const showAlert = useCallback((options: AdminAlertOptions) => {
    return new Promise<void>((resolve) => {
      resolveRef.current = resolve;
      setState({ ...options, open: true });
    });
  }, []);

  return (
    <AdminAlertContext.Provider value={{ showAlert }}>
      {children}
      {state ? <AdminAlertDialog state={state} onClose={close} /> : null}
    </AdminAlertContext.Provider>
  );
}

export function useAdminAlert(): AdminAlertContextValue {
  const ctx = useContext(AdminAlertContext);
  if (!ctx) {
    throw new Error("useAdminAlert must be used within AdminAlertProvider (admin panel shell).");
  }
  return ctx;
}
