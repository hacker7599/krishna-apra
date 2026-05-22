"use client";

import { useEffect } from "react";

/** Hides global site header, footer, and mobile CTA for receipt-only pages */
export function ReceiptStandaloneChrome({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("receipt-standalone-page");
    return () => document.documentElement.classList.remove("receipt-standalone-page");
  }, []);

  return <div className="receipt-standalone-root min-h-screen bg-slate-50">{children}</div>;
}
