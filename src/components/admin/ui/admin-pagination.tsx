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
    <div className={`admin-pagination ${className}`.trim()}>
      <p className="admin-pagination__summary">
        Showing <span className="font-bold text-slate-900">{from}</span>–<span className="font-bold text-slate-900">{to}</span> of{" "}
        <span className="font-bold text-slate-900">{total}</span>
      </p>
      <div className="admin-pagination__controls">
        <button
          type="button"
          disabled={offset <= 0}
          onClick={() => onChange(Math.max(0, offset - limit))}
          className="admin-pagination__btn"
        >
          Previous
        </button>
        <span className="admin-pagination__page">
          Page {page} / {pageCount}
        </span>
        <button
          type="button"
          disabled={offset + limit >= total}
          onClick={() => onChange(offset + limit)}
          className="admin-pagination__btn"
        >
          Next
        </button>
      </div>
    </div>
  );
}
