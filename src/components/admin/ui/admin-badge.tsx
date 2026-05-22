const styles: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  manual: "bg-sky-50 text-sky-800 ring-sky-600/20",
  pending: "bg-amber-50 text-amber-900 ring-amber-600/20",
  created: "bg-slate-100 text-slate-700 ring-slate-500/20",
  refunded: "bg-rose-50 text-rose-800 ring-rose-600/20",
  failed: "bg-rose-50 text-rose-800 ring-rose-600/20",
};

export function AdminBadge({ status }: { status: string | null | undefined }) {
  const key = (status ?? "pending").toLowerCase();
  const cls = styles[key] ?? styles.pending;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${cls}`}>
      {status ?? "—"}
    </span>
  );
}
