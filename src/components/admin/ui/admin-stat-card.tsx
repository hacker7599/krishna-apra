import Link from "next/link";

const accentClass = {
  navy: "admin-stat-card__accent bg-[#1B365D]",
  orange: "admin-stat-card__accent bg-orange-500",
  green: "admin-stat-card__accent bg-emerald-600",
  amber: "admin-stat-card__accent bg-amber-500",
} as const;

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
  accent?: keyof typeof accentClass;
}) {
  const inner = (
    <div className="admin-stat-card">
      <div className={accentClass[accent]} aria-hidden />
      <p className="admin-stat-card__label">{label}</p>
      <p className="admin-stat-card__value">{value}</p>
      {hint ? <p className="admin-stat-card__hint">{hint}</p> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-[var(--admin-radius)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B365D]/40">
        {inner}
      </Link>
    );
  }
  return inner;
}
