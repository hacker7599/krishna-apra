"use client";

import Link from "next/link";

export function OfflineFormPrintActions() {
  return (
    <div className="no-print mb-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-700">
        Use <strong>Print</strong> and choose <strong>Save as PDF</strong> (or your printer). In the print dialog, select <strong>A4</strong> paper (this
        layout is tuned for 210 × 297 mm).
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm hover:bg-orange-700"
        >
          Print / Save as PDF
        </button>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-slate-900 hover:bg-slate-50"
        >
          Online registration
        </Link>
      </div>
    </div>
  );
}
