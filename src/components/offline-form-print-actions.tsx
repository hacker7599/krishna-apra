"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/lib/site-ui";

const BODY_CLASS = "is-printing-offline-form";

export function OfflineFormPrintActions() {
  useEffect(() => {
    const clear = () => document.body.classList.remove(BODY_CLASS);
    window.addEventListener("afterprint", clear);
    return () => {
      window.removeEventListener("afterprint", clear);
      clear();
    };
  }, []);

  function handlePrint() {
    document.body.classList.add(BODY_CLASS);
    window.print();
  }

  return (
    <div className="no-print mx-auto mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Print or save as PDF (2 pages)</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
            Use <strong>Print</strong> → <strong>Save as PDF</strong>, paper <strong>A4</strong>, margins <strong>Default</strong> or <strong>Minimum</strong>. The form is laid out as <strong>page 1</strong> (details &amp; venues) and <strong>page 2</strong> (ID, payment &amp; signatures).
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={handlePrint} className={BTN_PRIMARY}>
            Print / PDF
          </button>
          <Link href="/register" className={BTN_SECONDARY}>
            Online form
          </Link>
        </div>
      </div>
    </div>
  );
}
