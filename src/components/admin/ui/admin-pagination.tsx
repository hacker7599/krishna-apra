"use client";

type Props = {
  total: number;
  limit: number;
  offset: number;
  onChange: (offset: number) => void;
  className?: string;
};

export function AdminPagination({ total, limit, offset, onChange, className = "" }: Props) {
  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);

  return (
    <div
      className={`flex flex-col gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="text-xs font-medium text-slate-600">
        Showing <span className="font-bold text-slate-900">{from}</span>–<span className="font-bold text-slate-900">{to}</span> of{" "}
        <span className="font-bold text-slate-900">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={offset <= 0}
          onClick={() => onChange(Math.max(0, offset - limit))}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="min-w-[5rem] text-center text-xs font-semibold text-slate-700">
          Page {page} / {pageCount}
        </span>
        <button
          type="button"
          disabled={offset + limit >= total}
          onClick={() => onChange(offset + limit)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
