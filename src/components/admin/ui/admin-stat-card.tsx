import Link from "next/link";

export function AdminStatCard({
  label,
  value,
  hint,
  href,
  accent = "navy",
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  accent?: "navy" | "orange" | "green" | "amber";
}) {
  const accentBar = {
    navy: "bg-[#1B365D]",
    orange: "bg-orange-500",
    green: "bg-emerald-600",
    amber: "bg-amber-500",
  }[accent];

  const inner = (
    <div className="admin-stat-card relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className={`absolute left-0 top-0 h-full w-1 ${accentBar}`} />
      <p className="pl-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="pl-3 mt-2 font-[family-name:var(--font-bebas)] text-4xl leading-none text-slate-900">{value}</p>
      {hint ? <p className="pl-3 mt-2 text-xs font-medium text-slate-600">{hint}</p> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B365D]/30 rounded-xl">
        {inner}
      </Link>
    );
  }
  return inner;
}
